import fs from 'fs'
import serialize from 'serialize-javascript'
import path from 'path'

import { createConfig } from './config/createConfig'
import createClient from './createClient'
import { Config, SSRConfig } from '../types'

const DEFAULT_CONFIG_PATH = './next-i18next.config.js'

export const serverSideTranslations = async (
  initialLocale: string,
  namespacesRequired: string[] = [],
  configOverride: Config = null,
): Promise<SSRConfig> => {
  let userConfig = configOverride

  if (fs.existsSync(path.resolve(DEFAULT_CONFIG_PATH))) {
    userConfig = await import(path.resolve(DEFAULT_CONFIG_PATH))
  }

  const config = createConfig({
    ...userConfig,
    lng: initialLocale,
  })
  const { i18n, initPromise } = createClient({
    ...config,
    lng: initialLocale,
  })

  await initPromise

  const initialI18nStore = {
    [initialLocale]: {}
  }

  namespacesRequired.forEach((ns) => {
    initialI18nStore[initialLocale][ns] = (
      (i18n.services.resourceStore.data[initialLocale] || {})[ns] || {}
    )
  })

  return {
    _nextI18Next: {
      initialI18nStore,
      initialLocale,
      userConfig: serialize(userConfig),
    }
  }
}
