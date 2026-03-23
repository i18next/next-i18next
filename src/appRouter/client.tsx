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
}: I18nProviderProps) {
  const [instance] = useState<I18NextClient>(() => {
    const inst = createInstance()
    inst.use(initReactI18next)

    const userHasBackend = use.some((b: Module) => b.type === 'backend')

    // Track which namespaces are bundled in the server-provided resources
    // so the default fetch backend can skip them
    const bundledNsSet = resources
      ? new Set(Object.values(resources).flatMap(r => Object.keys(r as Record<string, unknown>)))
      : new Set<string>()
    const bundledNs = bundledNsSet.size > 0 ? [...bundledNsSet] : [defaultNS]

    // Only add the default fetch-based backend if user hasn't provided one.
    // This allows using i18next-http-backend, i18next-locize-backend,
    // i18next-chained-backend, etc.
    if (!userHasBackend) {
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
    use.forEach((plugin: any) => inst.use(plugin))

    const hasAnyBackend = userHasBackend || !resources

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
 * Hook for changing the language without URL navigation (no-locale-path mode).
 * Updates cookie + i18next instance + triggers server re-render via router.refresh().
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
export function useChangeLanguage(cookieName = 'i18next') {
  const { i18n } = useTranslation()
  const router = useRouter()

  return useCallback(async (newLng: string) => {
    document.cookie = `${cookieName}=${newLng};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`
    await i18n.changeLanguage(newLng)
    router.refresh()
  }, [i18n, router, cookieName])
}

// Re-export useful react-i18next utilities for convenience
export { Trans } from 'react-i18next'
