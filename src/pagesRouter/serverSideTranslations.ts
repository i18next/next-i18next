import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'

import { createConfig } from './config/createConfig'
import { applyServerSideConfig } from './config/serverSideConfig'
import createClient from './createClient/node'

import { UserConfig, SSRConfig } from './types'
import { getFallbackForLng, unique } from './utils'
import { Module, Namespace } from 'i18next'

let DEFAULT_CONFIG_PATH = './next-i18next.config.js'

/**
 * One line expression like `const { I18NEXT_DEFAULT_CONFIG_PATH: DEFAULT_CONFIG_PATH = './next-i18next.config.js' } = process.env;`
 * is breaking the build, so keep it like this.
 *
 * @see https://github.com/i18next/next-i18next/pull/2084#issuecomment-1420511358
 */
if (process.env.I18NEXT_DEFAULT_CONFIG_PATH) {
  DEFAULT_CONFIG_PATH = process.env.I18NEXT_DEFAULT_CONFIG_PATH
}

type ArrayElementOrSelf<T> = T extends ReadonlyArray<infer U> ? U[] : T[]

export const serverSideTranslations = async (
  initialLocale: string,
  namespacesRequired:
    | ArrayElementOrSelf<Namespace>
    | string
    | string[]
    | undefined = undefined,
  configOverride: UserConfig | null = null,
  extraLocales: string[] | false = false
): Promise<SSRConfig> => {
  if (typeof initialLocale !== 'string') {
    throw new Error(
      'Initial locale argument was not passed into serverSideTranslations. ' +
        'Common causes: the i18n section is missing in next.config.js, or this page renders outside ' +
        "Next.js locale routing (custom 404/500, output: 'export'). In that case pass a locale explicitly, " +
        'e.g. serverSideTranslations(locale ?? nextI18NextConfig.i18n.defaultLocale, [...]).'
    )
  }

  let userConfig = configOverride
  const configPath = path.resolve(DEFAULT_CONFIG_PATH)

  if (!userConfig && fs.existsSync(configPath)) {
    // Use createRequire to prevent Turbopack/webpack from tracing this dynamic require.
    // Pass the absolute configPath itself as the base — works identically under CJS
    // and ESM output and avoids referencing __filename / import.meta.url.
    const nodeRequire = createRequire(configPath)
    userConfig = nodeRequire(configPath)
  }

  if (userConfig === null) {
    throw new Error(
      `next-i18next was unable to find a user config at ${configPath}`
    )
  }

  const config = createConfig(
    {
      ...userConfig,
      lng: initialLocale,
    },
    { applyServerSideConfig }
  )

  const {
    localeExtension,
    localePath,
    fallbackLng,
    reloadOnPrerender,
  } = config

  const { i18n, initPromise } = createClient({
    ...config,
    lng: initialLocale,
  })

  await initPromise

  const hasCustomBackend = userConfig?.use?.filter(Boolean).some(
    (b: Module) => b.type === 'backend'
  )
  if (hasCustomBackend && namespacesRequired) {
    await i18n.loadNamespaces(Array.isArray(namespacesRequired) ? (namespacesRequired as string[]) : (namespacesRequired as string))
  }

  const initialI18nStore: Record<string, any> = {
    [initialLocale]: {},
  }

  getFallbackForLng(initialLocale, fallbackLng ?? false)
    .concat(extraLocales || [])
    .forEach((lng: string) => {
      initialI18nStore[lng] = {}
    })

  if (!Array.isArray(namespacesRequired)) {
    if (typeof localePath === 'function') {
      throw new Error(
        'Must provide namespacesRequired to serverSideTranslations when using a function as localePath'
      )
    }

    const getLocaleNamespaces = (path: string) =>
      fs.existsSync(path)
        ? fs
          .readdirSync(path)
          .map(file => file.replace(`.${localeExtension}`, ''))
        : []

    const namespacesByLocale = Object.keys(initialI18nStore)
      .map(locale =>
        getLocaleNamespaces(
          path.resolve(process.cwd(), `${localePath}/${locale}`)
        )
      )
      .flat()

    namespacesRequired = unique(namespacesByLocale)
  }

  // Dev-only hot-reload: every backend (resources-to-backend, http, locize,
  // chained) refetches unconditionally with no dedup, so doing this in
  // production would hammer the source on every prerender call. Scope to
  // exactly the locales × namespaces this call will ship.
  if (reloadOnPrerender && process.env.NODE_ENV !== 'production') {
    await i18n.reloadResources(
      Object.keys(initialI18nStore),
      namespacesRequired as string[]
    )
  }

  namespacesRequired.forEach(ns => {
    for (const locale in initialI18nStore) {
      initialI18nStore[locale][ns] =
        (i18n.services.resourceStore.data[locale] || {})[ns] || {}
    }
  })

  return {
    _nextI18Next: {
      initialI18nStore,
      initialLocale,
      ns: namespacesRequired,
      userConfig: config.serializeConfig ? userConfig : null,
    },
  }
}
