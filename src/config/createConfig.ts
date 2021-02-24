import { defaultConfig } from './defaultConfig'
import { InternalConfig, UserConfig } from '../../types'

const deepMergeObjects = ['backend', 'detection']

export const createConfig = (userConfig: UserConfig): InternalConfig => {
  if (typeof userConfig?.lng !== 'string') {
    throw new Error('config.lng was not passed into createConfig')
  }

  //
  // Initial merge of default and user-provided config
  //
  const { i18n: userI18n, ...userConfigStripped } = userConfig
  const { i18n: defaultI18n, ...defaultConfigStripped } = defaultConfig
  const combinedConfig = {
    ...defaultConfigStripped,
    ...userConfigStripped,
    ...defaultI18n,
    ...userI18n,
  }

  const {
    defaultNS,
    lng,
    locales,
    localeExtension,
    localePath,
    localeStructure,
  } = combinedConfig

  /**
   * Skips translation file resolution while in cimode
   * https://github.com/isaachinman/next-i18next/pull/851#discussion_r503113620
  */
  if (lng === 'cimode') {
    return combinedConfig as InternalConfig
  }

  if (typeof combinedConfig.fallbackLng === 'undefined') {
    combinedConfig.fallbackLng = combinedConfig.defaultLocale
  }

  if (!process.browser) {
    combinedConfig.preload = locales

    const hasCustomBackend = userConfig?.use?.some((b) => b.type === 'backend')

    if (!hasCustomBackend) {
      const fs = require('fs')
      const path = require('path')
      const serverLocalePath = localePath

      //
      // Validate defaultNS
      // https://github.com/isaachinman/next-i18next/issues/358
      //
      if (typeof defaultNS === 'string') {
        const defaultLocaleStructure = localeStructure.replace('{{lng}}', lng).replace('{{ns}}', defaultNS)
        const defaultFile = `/${defaultLocaleStructure}.${localeExtension}`
        const defaultNSPath = path.join(localePath, defaultFile)
        const defaultNSExists = fs.existsSync(defaultNSPath)
        if (!defaultNSExists && process.env.NODE_ENV !== 'production') {
          throw new Error(`Default namespace not found at ${defaultNSPath}`)
        }
      }

      //
      // Set server side backend
      //
      combinedConfig.backend = {
        addPath: path.resolve(process.cwd(), `${serverLocalePath}/${localeStructure}.missing.${localeExtension}`),
        loadPath: path.resolve(process.cwd(), `${serverLocalePath}/${localeStructure}.${localeExtension}`),
      }

      //
      // Set server side preload (namespaces)
      //
      if (!combinedConfig.ns) {
        const getAllNamespaces = p => fs.readdirSync(p).map(file => file.replace(`.${localeExtension}`, ''))
        combinedConfig.ns = getAllNamespaces(path.resolve(process.cwd(), `${serverLocalePath}/${lng}`))
      }
    }
  } else {

    let clientLocalePath = localePath

    //
    // Remove public prefix from client site config
    //
    if (localePath.startsWith('/public/')) {
      clientLocalePath = localePath.replace(/^\/public/, '')
    }

    //
    // Set client side backend
    //
    combinedConfig.backend = {
      addPath: `${clientLocalePath}/${localeStructure}.missing.${localeExtension}`,
      loadPath: `${clientLocalePath}/${localeStructure}.${localeExtension}`,
    }

    combinedConfig.ns = [defaultNS]
  }

  //
  // Deep merge with overwrite - goes last
  //
  deepMergeObjects.forEach((obj) => {
    if (userConfig[obj]) {
      combinedConfig[obj] = {
        ...defaultConfig[obj],
        ...combinedConfig[obj],
        ...userConfig[obj],
      }
    }
  })

  return combinedConfig as InternalConfig
}
