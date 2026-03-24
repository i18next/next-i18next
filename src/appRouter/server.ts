import { createInstance } from 'i18next'
import type { i18n as I18NextClient, Resource, Module, FlatNamespace, KeyPrefix } from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { cache } from 'react'
import { headers, cookies } from 'next/headers'

import type { I18nConfig, NormalizedConfig, GetTResult } from './types'
import { normalizeConfig } from './config'

let _config: NormalizedConfig | null = null

// Module-level singleton: persists across requests within the same server process.
// This is critical for custom backends (i18next-http-backend, i18next-locize-backend)
// to avoid re-fetching translations on every request.
// In serverless environments (Lambda, Cloud Functions, etc.), this lives as long as
// the warm function instance — backends with reloadInterval will refresh automatically.
let _sharedInstance: I18NextClient | null = null
let _sharedInstancePromise: Promise<I18NextClient> | null = null

function getConfig(): NormalizedConfig {
  if (!_config) {
    throw new Error(
      'next-i18next: Server module not initialized. Call initServerI18next(config) in your root layout.'
    )
  }
  return _config
}

/**
 * Initialize the server-side i18next configuration.
 * Call this once in your root layout or a shared setup file.
 */
export function initServerI18next(userConfig: I18nConfig): void {
  _config = normalizeConfig(userConfig)
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
 * All languages are preloaded so that getFixedT(lng) works for any supported language.
 * Additional namespaces are loaded on demand and cached in the instance store.
 */
async function getSharedInstance(config: NormalizedConfig): Promise<I18NextClient> {
  if (_sharedInstance?.isInitialized) return _sharedInstance

  // Deduplicate concurrent init calls (multiple requests arriving while first init is in flight)
  if (_sharedInstancePromise) return _sharedInstancePromise

  _sharedInstancePromise = (async () => {
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
      preload: config.supportedLngs, // preload ALL languages upfront
      interpolation: { escapeValue: false },
      ...(config.resources ? { resources: config.resources } : {}),
      ...config.i18nextOptions,
    })

    _sharedInstance = i18nInstance
    return i18nInstance
  })()

  return _sharedInstancePromise
}

// Per-request language detection, deduplicated within a single React render
const detectLanguage = cache(async (config: NormalizedConfig): Promise<string> => {
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
  options: { keyPrefix?: KPrefix; lng?: string } = {},
): Promise<GetTResult<Ns, KPrefix>> {
  const config = getConfig()

  const lng = options.lng || await detectLanguage(config)
  const i18nInstance = await getSharedInstance(config)

  // Load additional namespaces on demand if not already loaded
  const nsArray: string[] = ns
    ? (Array.isArray(ns) ? ns as string[] : [ns as string])
    : config.ns
  const missingNs = nsArray.filter(n => !i18nInstance.hasLoadedNamespace(n))
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
 * @example
 * ```tsx
 * const { i18n } = await getT()
 * const resources = getResources(i18n, ['common', 'footer'])
 * return <I18nProvider language={i18n.language} resources={resources}>{children}</I18nProvider>
 * ```
 */
export function getResources(
  i18n: I18NextClient,
  namespaces?: string[],
): Resource {
  const resources: Resource = {}
  const store = i18n.store?.data || {}
  const nsFilter = namespaces ? new Set(namespaces) : null

  for (const lng of Object.keys(store)) {
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
 * Helper for generateStaticParams — returns params for all supported languages.
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
export function generateI18nStaticParams(): { lng: string }[] {
  const config = getConfig()
  return config.supportedLngs.map(lng => ({ lng }))
}
