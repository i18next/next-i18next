import defaultConfig, { isServer } from './default-config'

const deepMergeObjects = ['backend', 'detection']

export default (userConfig) => {

  if (typeof userConfig.localeSubpaths === 'boolean') {
    throw new Error('The localeSubpaths option has been changed to a string: "none", "foreign", or "all"')
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

  if (isServer) {

    const fs = eval("require('fs')")
    const path = require('path')

    // Set server side backend
    combinedConfig.backend = {
      loadPath: path.join(process.cwd(), `${localePath}/${localeStructure}.${localeExtension}`),
      addPath: path.join(process.cwd(), `${localePath}/${localeStructure}.missing.${localeExtension}`),
    }

    // Set server side preload (languages and namespaces)
    combinedConfig.preload = allLanguages
    if (!combinedConfig.ns) {
      const getAllNamespaces = p => fs.readdirSync(p).map(file => file.replace(`.${localeExtension}`, ''))
      combinedConfig.ns = getAllNamespaces(path.join(process.cwd(), `${localePath}/${defaultLanguage}`))
    }

  } else {

    // Set client side backend
    combinedConfig.backend = {
      loadPath: `/${localePath}/${localeStructure}.${localeExtension}`,
      addPath: `/${localePath}/${localeStructure}.missing.${localeExtension}`,
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
