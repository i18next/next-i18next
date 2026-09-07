import { createInstance } from 'i18next'
import type { i18n as I18NextClient, Resource, Module, FlatNamespace, KeyPrefix } from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { cache } from 'react'
import { headers, cookies } from 'next/headers'

import type { I18nConfig, NormalizedConfig, GetTResult } from './types'
import { normalizeConfig } from './config'
import { findSupportedMatch } from './proxy/languageDetector'

// Everything getT needs: the config plus the shared i18next instance. The instance
// persists across requests within the same server process, which is critical for
// custom backends (i18next-http-backend, i18next-locize-backend) to avoid re-fetching
// translations on every request. In serverless environments it lives as long as the
// warm function instance — backends with reloadInterval refresh automatically.
interface ServerState {
  config: NormalizedConfig
  instance: I18NextClient | null
  instancePromise: Promise<I18NextClient> | null
}

function createState(userConfig: I18nConfig): ServerState {
  return { config: normalizeConfig(userConfig), instance: null, instancePromise: null }
}

// The default state (initServerI18next + module-level getT) is keyed on globalThis, so a
// second copy of this module in the same process — another bundling layer such as a
// Route Handler, or the CJS build next to the ESM one — sees the same initialization.
const GLOBAL_KEY = Symbol.for('next-i18next.server')
const shared: { state: ServerState | null } = ((globalThis as any)[GLOBAL_KEY] ??= { state: null })

function getState(): ServerState {
  if (!shared.state) {
    throw new Error(
      'next-i18next: server i18n is not initialized. Call initServerI18next(config) before the first ' +
      'getT() in this process, or use createServerI18next(config) and import getT from its result, ' +
      'which needs no initialization.'
    )
  }
  return shared.state
}

/**
 * Initialize the server-side i18next configuration for the module-level `getT`.
 * Call it once at module scope, before the first `getT()` in the process (the root
 * layout works in practice). Calling it again only replaces the config; the shared
 * i18next instance is kept. Prefer `createServerI18next` when you would rather not
 * depend on module evaluation order.
 */
export function initServerI18next(userConfig: I18nConfig): void {
  if (shared.state) {
    shared.state.config = normalizeConfig(userConfig)
  } else {
    shared.state = createState(userConfig)
  }
}

function hasCustomBackend(plugins: any[]): boolean {
  return plugins.some((b: Module) => b.type === 'backend')
}

function createResourceBackend(config: NormalizedConfig) {
  if (config.resourceLoader) {
    return resourcesToBackend(config.resourceLoader)
  }
  return resourcesToBackend(async (language: string, namespace: string) => {
    const filePath = `${config.localePath}/${config.localeStructure
      .replace('{{lng}}', language)
      .replace('{{ns}}', namespace)}.${config.localeExtension}`

    // Node.js runtime: read from filesystem
    if (typeof process !== 'undefined' && process.versions?.node) {
      try {
        const fs = await import('fs/promises')
        const pathMod = await import('path')
        const resolved = pathMod.resolve(process.cwd(), `public${filePath}`)
        const content = await fs.readFile(resolved, 'utf-8')
        return JSON.parse(content)
      } catch {
        throw new Error(
          `next-i18next: Could not read locale file "public${filePath}". ` +
          'On serverless platforms (Vercel, AWS Lambda, etc.), files in public/ are served via CDN ' +
          'but are NOT available on the filesystem at runtime. Use the `resourceLoader` option with ' +
          'dynamic imports instead:\n\n' +
          '  resourceLoader: (language, namespace) =>\n' +
          // eslint-disable-next-line no-template-curly-in-string
          '    import(`./public/locales/${language}/${namespace}.json`)\n'
        )
      }
    }

    // Edge runtime: filesystem not available
    throw new Error(
      `next-i18next: Cannot load locale file "${filePath}" in Edge Runtime. ` +
      'Provide pre-bundled `resources`, a custom `resourceLoader`, or use a custom backend (e.g. i18next-http-backend) via the `use` option.'
    )
  })
}

/**
 * Get or create the shared i18next instance.
 * The instance is created once and reused across all requests.
 * By default all languages are preloaded so that getFixedT(lng) works for any
 * supported language; with `i18nextOptions.preload: []` each language is loaded
 * on its first request instead (see getT). Additional namespaces are loaded on
 * demand and cached in the instance store.
 */
async function getSharedInstance(state: ServerState): Promise<I18NextClient> {
  const { config } = state
  if (state.instance?.isInitialized) return state.instance

  // Deduplicate concurrent init calls (multiple requests arriving while first init is in flight)
  if (state.instancePromise) return state.instancePromise

  state.instancePromise = (async () => {
    const i18nInstance = createInstance()

    // Add a backend when needed:
    // - No resources provided → backend loads everything
    // - Resources provided with partialBundledLanguages → backend loads the rest
    // - Custom backend in config.use → user handles it, skip default backend
    const partialBundled = config.i18nextOptions?.partialBundledLanguages
    if ((!config.resources || partialBundled) && !hasCustomBackend(config.use)) {
      i18nInstance.use(createResourceBackend(config))
    }

    config.use.forEach((plugin: any) => i18nInstance.use(plugin))

    await i18nInstance.init({
      // No `lng` — the shared instance is language-neutral.
      // We use getFixedT(lng, ns) to get language-specific translators.
      lng: config.fallbackLng,
      ns: config.ns,
      defaultNS: config.defaultNS,
      fallbackLng: config.fallbackLng,
      supportedLngs: config.supportedLngs,
      nonExplicitSupportedLngs: config.nonExplicitSupportedLngs,
      fallbackNS: config.defaultNS,
      preload: config.supportedLngs, // preload ALL languages upfront (override via i18nextOptions.preload)
      interpolation: { escapeValue: false },
      ...(config.resources ? { resources: config.resources } : {}),
      ...config.i18nextOptions,
    })

    state.instance = i18nInstance
    return i18nInstance
  })()

  return state.instancePromise
}

// Dev-only hot-reload: refetch resources for the requested language so edits
// to locale files appear without restarting `next dev`. Wrapped in `cache()`
// so multiple `getT` calls within the same render dedupe to a single reload.
// Gated on `NODE_ENV !== 'production'` at the call site so HTTP/locize/chained
// backends are never refetched per-request in prod.
const reloadResourcesForRender = cache(
  async (i18n: I18NextClient, lng: string): Promise<void> => {
    const ns = (i18n.options.ns as string[] | undefined) ?? []
    await i18n.reloadResources([lng], ns)
  }
)

// Root params (Next.js >= 16.3) are part of the route key, so reading them keeps
// the route statically prerenderable — unlike headers()/cookies(), which opt it out.
// `next/root-params` is generated by the Next compiler with one accessor per root
// param. It throws on older Next, in Route Handlers and Server Actions, and the
// accessor is missing when the current root layout has no such segment; every
// failure falls through to header/cookie detection. (A prerender postpone that
// gets swallowed here is re-raised by headers() right after.)
async function detectFromRootParams(config: NormalizedConfig): Promise<string | undefined> {
  try {
    const rootParams: Record<string, (() => Promise<unknown>) | undefined> = await import('next/root-params')
    const value = await rootParams[config.localeParamName]?.()
    if (typeof value !== 'string') return undefined
    return findSupportedMatch(value, config.supportedLngs, config.nonExplicitSupportedLngs)
  } catch {
    return undefined
  }
}

// Per-request language detection, deduplicated within a single React render
const detectLanguage = cache(async (config: NormalizedConfig): Promise<string> => {
  const fromRoute = await detectFromRootParams(config)
  if (fromRoute) return fromRoute

  const headerList = await headers()
  const fromHeader = headerList.get(config.headerName)
  if (fromHeader) return fromHeader

  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(config.cookieName)?.value
  if (cookieValue) {
    if (config.supportedLngs.includes(cookieValue)) {
      return cookieValue
    }
    // nonExplicitSupportedLngs: e.g. cookie 'en' matches supported 'en-US'
    if (config.nonExplicitSupportedLngs) {
      const prefix = cookieValue.toLowerCase().split('-')[0]
      const match = config.supportedLngs.find(
        l => l.toLowerCase() === prefix || l.toLowerCase().split('-')[0] === prefix
      )
      if (match) return match
    }
  }

  return config.fallbackLng
})

/**
 * Get a translation function for use in Server Components, layouts, and generateMetadata.
 *
 * The underlying i18next instance is a **module-level singleton** that persists across
 * requests. This means custom backends (i18next-http-backend, i18next-locize-backend, etc.)
 * only fetch translations once (or according to their own reloadInterval), not on every request.
 *
 * @example
 * ```tsx
 * import { getT } from 'next-i18next/server'
 *
 * export default async function Page() {
 *   const { t, i18n } = await getT('home')
 *   return <h1>{t('heading')}</h1>
 * }
 * ```
 */
export async function getT<
  Ns extends FlatNamespace = FlatNamespace,
  KPrefix extends KeyPrefix<Ns> = undefined,
>(
  ns?: Ns | Ns[],
  options: GetTOptions<KPrefix> = {},
): Promise<GetTResult<Ns, KPrefix>> {
  return getTWith<Ns, KPrefix>(getState(), ns, options)
}

type GetTOptions<KPrefix> = { keyPrefix?: KPrefix; lng?: string }

async function getTWith<
  Ns extends FlatNamespace = FlatNamespace,
  KPrefix extends KeyPrefix<Ns> = undefined,
>(
  state: ServerState,
  ns?: Ns | Ns[],
  options: GetTOptions<KPrefix> = {},
): Promise<GetTResult<Ns, KPrefix>> {
  const { config } = state

  const lng = options.lng || await detectLanguage(config)
  const i18nInstance = await getSharedInstance(state)

  if (config.reloadOnPrerender && process.env.NODE_ENV !== 'production') {
    await reloadResourcesForRender(i18nInstance, lng)
  }

  // Load the requested language on demand. No-op when it is already preloaded
  // (the default preloads every supported language); with `preload: []` this is
  // what makes a language load on first use instead of all of them upfront.
  await i18nInstance.loadLanguages(lng)

  // Load additional namespaces on demand if not already loaded for this language
  const nsArray: string[] = ns
    ? (Array.isArray(ns) ? ns as string[] : [ns as string])
    : config.ns
  const missingNs = nsArray.filter(n => !i18nInstance.hasLoadedNamespace(n, { lng }))
  if (missingNs.length > 0) {
    await i18nInstance.loadNamespaces(missingNs)
  }

  const resolvedNs = ns
    ? (Array.isArray(ns) ? ns[0] : ns) as string
    : config.defaultNS

  return {
    t: i18nInstance.getFixedT(lng, resolvedNs, options.keyPrefix as string | undefined),
    i18n: i18nInstance,
    lng,
  } as any
}

/**
 * Extract loaded resources from the server i18next instance for passing to I18nProvider.
 *
 * The shared instance preloads every supported language by default, so this
 * returns all of them and they are all serialized into the HTML. On projects
 * with more than a handful of languages that payload dominates the page, so pass
 * `languages` to ship only what the client actually renders. Include your
 * fallback language there as well, otherwise keys missing from the current
 * language have nothing to fall back to on the client.
 *
 * @example
 * ```tsx
 * const { i18n, lng } = await getT()
 * const resources = getResources(i18n, ['common', 'footer'], [lng, 'en'])
 * return <I18nProvider language={lng} resources={resources}>{children}</I18nProvider>
 * ```
 */
export function getResources(
  i18n: I18NextClient,
  namespaces?: string[],
  languages?: string[],
): Resource {
  const resources: Resource = {}
  const store = i18n.store?.data || {}
  const nsFilter = namespaces ? new Set(namespaces) : null
  const lngFilter = languages ? new Set(languages) : null

  for (const lng of Object.keys(store)) {
    if (lngFilter && !lngFilter.has(lng)) continue
    resources[lng] = {}
    for (const ns of Object.keys(store[lng])) {
      if (!nsFilter || nsFilter.has(ns)) {
        resources[lng][ns] = store[lng][ns]
      }
    }
  }

  return resources
}

/**
 * Helper for generateStaticParams — returns params for all supported languages,
 * keyed by `localeParamName` (default `lng`, e.g. `[{ lng: 'en' }, { lng: 'de' }]`).
 * The type parameter only narrows the key for TypeScript: with
 * `localeParamName: 'locale'` call `generateI18nStaticParams<'locale'>()`.
 *
 * @example
 * ```tsx
 * import { generateI18nStaticParams } from 'next-i18next/server'
 *
 * export async function generateStaticParams() {
 *   return generateI18nStaticParams()
 * }
 * ```
 */
export function generateI18nStaticParams<K extends string = 'lng'>(): Record<K, string>[] {
  return staticParamsFor<K>(getState().config)
}

function staticParamsFor<K extends string>({ supportedLngs, localeParamName }: NormalizedConfig): Record<K, string>[] {
  return supportedLngs.map(lng => ({ [localeParamName]: lng }) as Record<K, string>)
}

export interface ServerI18next {
  getT: typeof getT
  getResources: typeof getResources
  generateI18nStaticParams: typeof generateI18nStaticParams
}

/**
 * Bind the server API to a config, without `initServerI18next` and without depending on
 * module evaluation order: every caller imports the module that holds the config.
 * Call it once at module scope — each call owns its own shared i18next instance.
 *
 * @example
 * ```ts
 * // i18n.server.ts
 * import { createServerI18next } from 'next-i18next/server'
 * import i18nConfig from './i18n.config'
 *
 * export const { getT, getResources, generateI18nStaticParams } = createServerI18next(i18nConfig)
 * ```
 */
export function createServerI18next(userConfig: I18nConfig): ServerI18next {
  const state = createState(userConfig)
  return {
    getT: (ns, options) => getTWith(state, ns, options),
    getResources,
    generateI18nStaticParams: () => staticParamsFor(state.config),
  }
}
