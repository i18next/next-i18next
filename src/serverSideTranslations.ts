import fs from 'fs'
import path from 'path'

import { createConfig } from './config/createConfig'
import createClient from './createClient'

import { UserConfig, SSRConfig } from './types'
import { FallbackLng } from 'i18next'

const DEFAULT_CONFIG_PATH = './next-i18next.config.js'

const getFallbackLocales = (fallbackLng: false | FallbackLng) => {
  if (typeof fallbackLng === 'string') {
    return [fallbackLng]
  }
  if (Array.isArray(fallbackLng)) {
    return fallbackLng
  }
  if (typeof fallbackLng === 'object' && fallbackLng !== null) {
    return Object
      .values(fallbackLng)
      .reduce((all, locales) => [...all, ...locales],[])
  }
  return []
}

const flatNamespaces = (namespacesByLocale: string[][]) => {
  const allNamespaces = []
  for (const localNamespaces of namespacesByLocale) {
    allNamespaces.push(...localNamespaces)
  }
  return Array.from(new Set(allNamespaces))
}

export const serverSideTranslations = async (
  initialLocale: string,
  namespacesRequired: string[] | undefined = undefined,
  configOverride: UserConfig | null = null,
): Promise<SSRConfig> => {
  if (typeof initialLocale !== 'string') {
    throw new Error('Initial locale argument was not passed into serverSideTranslations')
  }

  let userConfig = configOverride

  if (fs.existsSync(path.resolve(DEFAULT_CONFIG_PATH))) {
    userConfig = await import(path.resolve(DEFAULT_CONFIG_PATH))
  }

  if (userConfig === null) {
    throw new Error('next-i18next was unable to find a user config')
  }

  const config = createConfig({
    ...userConfig,
    lng: initialLocale,
  })

  const {
    localeExtension,
    localePath,
    fallbackLng,
  } = config

  const { i18n, initPromise } = createClient({
    ...config,
    lng: initialLocale,
  })

  await initPromise

  const initialI18nStore: Record<string, any> = {
    [initialLocale]: {},
  }

  getFallbackLocales(fallbackLng).forEach(lng => {
    initialI18nStore[lng] = {}
  })

  if (!Array.isArray(namespacesRequired)) {
    const getLocaleNamespaces = (path: string) =>
      fs.readdirSync(path)
        .map(file => file.replace(`.${localeExtension}`, ''))

    const namespacesByLocale = Object.keys(initialI18nStore)
      .map(locale => getLocaleNamespaces(path.resolve(process.cwd(), `${localePath}/${locale}`)))

    namespacesRequired = flatNamespaces(namespacesByLocale)
  }

  namespacesRequired.forEach((ns) => {
    for (const locale in initialI18nStore) {
      initialI18nStore[locale][ns] = (
        (i18n.services.resourceStore.data[locale] || {})[ns] || {}
      )
    }
  })

  return {
    _nextI18Next: {
      initialI18nStore,
      initialLocale,
      userConfig: config.serializeConfig ? userConfig : null,
    },
  }
}
