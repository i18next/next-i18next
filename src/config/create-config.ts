import defaultConfig from './default-config'
import { isServer } from '../utils'

const deepMergeObjects = ['backend', 'detection']
const STATIC_LOCALE_PATH = 'static/locales'

export default (userConfig) => {

  if (typeof userConfig.localeSubpaths === 'string') {
    throw new Error('The localeSubpaths option has been changed to an object. Please refer to documentation.')
  }

  // Initial merge of default and user-provided config
  const combinedConfig = {
    ...defaultConfig,
    ...userConfig,
  }

  // Sensible defaults to prevent user duplication
  combinedConfig.allLanguages = combinedConfig.otherLanguages
    .concat([combinedConfig.defaultLanguage])
  combinedConfig.whitelist = combinedConfig.allLanguages

  const {
    allLanguages,
    defaultLanguage,
    localeExtension,
    localePath,
    localeStructure,
  } = combinedConfig

  if (isServer()) {

    const fs = eval("require('fs')")
    const path = require('path')
    let serverLocalePath = localePath

    // Validate defaultNS
    // https://github.com/isaachinman/next-i18next/issues/358
    if (process.env.NODE_ENV !== 'production' && typeof combinedConfig.defaultNS === 'string') {
      const defaultNSPath = path.join(process.cwd(), `${localePath}/${defaultLanguage}/${combinedConfig.defaultNS}.${localeExtension}`)
      const defaultNSExists = fs.existsSync(defaultNSPath)
      if (!defaultNSExists) {
        // if defaultNS doesn't exist, try to fall back to the deprecated static folder
        // https://github.com/isaachinman/next-i18next/issues/523
        if (fs.existsSync(path.join(process.cwd(), `${STATIC_LOCALE_PATH}/${defaultLanguage}/${combinedConfig.defaultNS}.${localeExtension}`))) {
          console.warn('Deprecation Warning - falling back to /static folder, deprecated in next@9.1.*')
          serverLocalePath = STATIC_LOCALE_PATH
        } else {
          throw new Error(`Default namespace not found at ${defaultNSPath}`)
        }
      }
    }

    // Set server side backend
    combinedConfig.backend = {
      loadPath: path.join(process.cwd(), `${serverLocalePath}/${localeStructure}.${localeExtension}`),
      addPath: path.join(process.cwd(), `${serverLocalePath}/${localeStructure}.missing.${localeExtension}`),
    }

    // Set server side preload (languages and namespaces)
    combinedConfig.preload = allLanguages
    if (!combinedConfig.ns) {
      const getAllNamespaces = p => fs.readdirSync(p).map(file => file.replace(`.${localeExtension}`, ''))
      combinedConfig.ns = getAllNamespaces(path.join(process.cwd(), `${serverLocalePath}/${defaultLanguage}`))
    }

  } else {

    // remove public/ prefix from client site config
    const clientLocalePath = localePath.replace(/^public\//, '')

    // Set client side backend
    combinedConfig.backend = {
      loadPath: `/${clientLocalePath}/${localeStructure}.${localeExtension}`,
      addPath: `/${clientLocalePath}/${localeStructure}.missing.${localeExtension}`,
    }

    combinedConfig.ns = [combinedConfig.defaultNS]
  }

  // Set fallback language to defaultLanguage in production
  if (!userConfig.fallbackLng) {
    combinedConfig.fallbackLng = process.env.NODE_ENV === 'production'
      ? combinedConfig.defaultLanguage
      : false
  }

  // Deep merge with overwrite - goes last
  deepMergeObjects.forEach((obj) => {
    if (userConfig[obj]) {
      combinedConfig[obj] = {
        ...defaultConfig[obj],
        ...userConfig[obj],
      }
    }
  })

  return combinedConfig

}
