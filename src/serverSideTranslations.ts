import fs from 'fs'
import path from 'path'

import { createConfig } from './config/createConfig'
import createClient from './createClient'

import { UserConfig, SSRConfig } from './types'

export const DEFAULT_CONFIG_PATH = './next-i18next.config.js'

export const serverSideTranslations = async (
  initialLocale: string,
  namespacesRequired: string[] = [],
  configOverride: UserConfig | null = null,
): Promise<SSRConfig> => {
  if (typeof initialLocale !== 'string') {
    throw new Error('Initial locale argument was not passed into serverSideTranslations')
  }

  let userConfig: UserConfig | null = null

  if (configOverride) {
    userConfig = configOverride
  } else if (fs.existsSync(path.resolve(DEFAULT_CONFIG_PATH))) {
    userConfig = await import(path.resolve(DEFAULT_CONFIG_PATH))
  }

  if (!userConfig) {
    throw new Error('next-i18next was unable to find a user config or one was not passed to serverSideTranslations')
  }

  const config = createConfig({
    ...userConfig,
    lng: initialLocale,
  })

  const {
    defaultLocale,
    localeExtension,
    localePath,
  } = config

  const { i18n, initPromise } = createClient({
    ...config,
    lng: initialLocale,
  })

  await initPromise

  const initialI18nStore: Record<string, any> = {
    [initialLocale]: {},
  }

  if (typeof config.fallbackLng === 'string') {
    initialI18nStore[config.fallbackLng] = {}
  }

  if (namespacesRequired.length === 0) {
    const getAllNamespaces = (path: string) =>
      fs.readdirSync(path)
        .map(file => file.replace(`.${localeExtension}`, ''))

    namespacesRequired = getAllNamespaces(path.resolve(process.cwd(), `${localePath}/${defaultLocale}`))
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
