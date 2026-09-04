'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createInstance } from 'i18next'
import type { i18n as I18NextClient, Resource, FlatNamespace, KeyPrefix, Module } from 'i18next'
import {
  I18nextProvider,
  useTranslation,
  type UseTranslationOptions,
  type UseTranslationResponse,
  type FallbackNs,
} from 'react-i18next'
import { initReactI18next } from 'react-i18next/initReactI18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { useParams, useRouter } from 'next/navigation'
import type { CookieOptions } from './types'

type $Tuple<T> = readonly [T?, ...T[]]

// ---------------------------------------------------------------------------
// I18nProvider
// ---------------------------------------------------------------------------

export interface I18nProviderProps {
  children: React.ReactNode
  /** Current language (detected on the server, passed from layout) */
  language: string
  /** Server-loaded resources to hydrate the client instance */
  resources?: Resource
  /** All supported languages */
  supportedLngs?: string[]
  /** Default namespace */
  defaultNS?: string
  /** Fallback language */
  fallbackLng?: string | string[] | Record<string, string[]>
  /** Path to locale files (for lazy-loading additional namespaces on the client) */
  localePath?: string
  /** Locale file structure pattern */
  localeStructure?: string
  /** Locale file extension */
  localeExtension?: string
  /** Extra i18next plugins (e.g., i18next-http-backend, i18next-locize-backend) */
  use?: any[]
  /** Additional i18next init options */
  i18nextOptions?: Record<string, any>
  /** Also apply the backends from `use` during the server render pass (default false).
   *  Lets Client Components load namespaces that are not in `resources` on the server, so
   *  with `i18nextOptions: { react: { useSuspense: true } }` a missing namespace suspends
   *  into the nearest `<Suspense>` boundary and streams in instead of rendering keys.
   *  Only for backends without timers or relative URLs (e.g. `i18next-resources-to-backend`
   *  with dynamic imports); http/locize backends must stay browser-only. */
  ssrBackend?: boolean
}

/**
 * Client-side i18next provider for App Router.
 * Creates an i18next instance hydrated with server-loaded resources,
 * with fallback dynamic loading for additional namespaces.
 *
 * Supports custom backends via the `use` prop — pass i18next-http-backend,
 * i18next-locize-backend, or i18next-chained-backend to load translations
 * from external sources.
 *
 * @example
 * ```tsx
 * // In app/[lng]/layout.tsx (Server Component)
 * import { I18nProvider } from 'next-i18next/client'
 * import { getT, getResources } from 'next-i18next/server'
 *
 * export default async function Layout({ children, params }) {
 *   const { lng } = await params
 *   const { i18n } = await getT()
 *   const resources = getResources(i18n, ['common'])
 *   return (
 *     <I18nProvider language={lng} resources={resources}>
 *       {children}
 *     </I18nProvider>
 *   )
 * }
 * ```
 */
export function I18nProvider({
  children,
  language,
  resources,
  supportedLngs,
  defaultNS = 'common',
  fallbackLng,
  localePath = '/locales',
  localeStructure = '{{lng}}/{{ns}}',
  localeExtension = 'json',
  use = [],
  i18nextOptions = {},
  ssrBackend = false,
}: I18nProviderProps) {
  const [instance] = useState<I18NextClient>(() => {
    const inst = createInstance()
    inst.use(initReactI18next)

    // This is a Client Component, but the App Router still renders it on the
    // server, once per request, so this initializer runs in Node on every
    // render, producing a throwaway instance that is never reused.
    // Backends must therefore stay browser-only: attaching one here would make
    // each render fetch (or worse, register a refresh timer: i18next-locize-backend
    // defaults `reloadInterval` to 1h whenever `window` is undefined, and that
    // timer keeps the whole throwaway instance alive, so every render permanently
    // adds background traffic until the process restarts).
    // The server pass renders from `resources`; the browser instance fetches.
    // `ssrBackend` opts a timer-free backend back in for the server pass.
    const isBrowser = typeof window !== 'undefined'
    const applyBackends = isBrowser || ssrBackend
    const plugins = applyBackends ? use : use.filter((p: Module) => p.type !== 'backend')

    const userHasBackend = plugins.some((b: Module) => b.type === 'backend')

    // Track which namespaces are bundled in the server-provided resources
    // so the default fetch backend can skip them
    const bundledNsSet = resources
      ? new Set(Object.values(resources).flatMap(r => Object.keys(r as Record<string, unknown>)))
      : new Set<string>()
    const bundledNs = bundledNsSet.size > 0 ? [...bundledNsSet] : [defaultNS]

    // Only add the default fetch-based backend if user hasn't provided one.
    // This allows using i18next-http-backend, i18next-locize-backend,
    // i18next-chained-backend, etc. Browser-only for the same reason, and its
    // relative `localePath` cannot be resolved by `fetch` in Node anyway.
    if (isBrowser && !userHasBackend) {
      inst.use(resourcesToBackend((lng: string, ns: string) => {
        // Skip fetching for namespaces already provided via server resources
        if (bundledNsSet.has(ns)) return {}
        const path = `${localePath}/${localeStructure
          .replace('{{lng}}', lng)
          .replace('{{ns}}', ns)}.${localeExtension}`
        return fetch(path).then(r => r.ok ? r.json() : {})
      }))
    }

    // Apply user-provided plugins
    plugins.forEach((plugin: any) => inst.use(plugin))

    const hasAnyBackend = applyBackends && (userHasBackend || !resources)

    inst.init({
      lng: language,
      resources,
      ns: bundledNs,
      partialBundledLanguages: hasAnyBackend,
      defaultNS,
      fallbackLng: fallbackLng ?? language,
      supportedLngs: supportedLngs ?? (resources ? Object.keys(resources) : [language]),
      fallbackNS: defaultNS,
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
      ...i18nextOptions,
    })

    return inst
  })

  // Sync language when the prop changes (e.g., after navigation)
  useEffect(() => {
    if (instance.language !== language) {
      instance.changeLanguage(language)
    }
  }, [instance, language])

  return (
    <I18nextProvider i18n={instance}>
      {children}
    </I18nextProvider>
  )
}

// ---------------------------------------------------------------------------
// useT — translation hook for Client Components
// ---------------------------------------------------------------------------

/**
 * Translation hook for Client Components in App Router.
 * Works in both locale-in-path and no-locale-path modes:
 * - Locale-in-path: reads language from URL params (`[lng]` or `[locale]`) and syncs
 * - No-locale-path: uses the language set by I18nProvider (from server detection)
 *
 * @example
 * ```tsx
 * 'use client'
 * import { useT } from 'next-i18next/client'
 *
 * export default function Counter() {
 *   const { t } = useT('home')
 *   return <p>{t('greeting')}</p>
 * }
 * ```
 */
export function useT<
  Ns extends FlatNamespace | $Tuple<FlatNamespace> | undefined = undefined,
  KPrefix extends KeyPrefix<FallbackNs<Ns>> = undefined,
>(
  ns?: Ns,
  options?: UseTranslationOptions<KPrefix>,
): UseTranslationResponse<FallbackNs<Ns>, KPrefix> {
  const params = useParams()
  // Support both [lng] and [locale] param names
  const lngFromParams = typeof params?.lng === 'string'
    ? params.lng
    : typeof params?.locale === 'string'
      ? params.locale
      : undefined
  const ret = useTranslation(ns, options)

  // Sync language from URL params (locale-in-path mode)
  useEffect(() => {
    if (lngFromParams && ret.i18n.resolvedLanguage !== lngFromParams) {
      ret.i18n.changeLanguage(lngFromParams)
    }
  }, [lngFromParams, ret.i18n])

  return ret
}

// ---------------------------------------------------------------------------
// useChangeLanguage — for no-locale-path mode
// ---------------------------------------------------------------------------

/**
 * Hook for changing the language without URL navigation (no-locale-path and internal mode).
 * Updates cookie + i18next instance + triggers server re-render via router.refresh().
 * `cookieOptions` takes the same attributes as the proxy's `cookieOptions` (domain, secure,
 * sameSite, path, maxAge) so both writers agree on the cookie's scope.
 *
 * @example
 * ```tsx
 * 'use client'
 * import { useChangeLanguage } from 'next-i18next/client'
 *
 * export default function LanguageSwitcher() {
 *   const changeLanguage = useChangeLanguage()
 *   return <button onClick={() => changeLanguage('de')}>Deutsch</button>
 * }
 * ```
 */
export function useChangeLanguage(cookieName = 'i18next', cookieOptions: CookieOptions = {}) {
  const { i18n } = useTranslation()
  const router = useRouter()
  const { domain, secure, sameSite = 'lax', path = '/', maxAge = 365 * 24 * 60 * 60 } = cookieOptions

  return useCallback(async (newLng: string) => {
    let cookie = `${cookieName}=${newLng};path=${path};max-age=${maxAge};SameSite=${sameSite[0].toUpperCase()}${sameSite.slice(1)}`
    if (domain) cookie += `;domain=${domain}`
    if (secure) cookie += ';Secure'
    document.cookie = cookie
    await i18n.changeLanguage(newLng)
    router.refresh()
  }, [i18n, router, cookieName, domain, secure, sameSite, path, maxAge])
}

// Re-export useful react-i18next utilities for convenience
export { Trans } from 'react-i18next'
