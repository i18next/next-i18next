import defaultConfig from 'config/default-config'
import isNode from 'detect-node'

const userDefinedBackend = userConfig => typeof userConfig.backend === 'object'

export default (userConfig) => {

  let combinedConfig = {
    ...defaultConfig,
    ...userConfig,
  }

  if (!userConfig.fallbackLng) {
    combinedConfig.fallbackLng = process.env.NODE_ENV === 'production'
      ? combinedConfig.defaultLanguage
      : null
  }

  combinedConfig.allLanguages = combinedConfig.otherLanguages
    .concat([combinedConfig.defaultLanguage])
  combinedConfig.ns = [combinedConfig.defaultNS]

  if (!userDefinedBackend(userConfig)) {
    combinedConfig.backend = {}
  }

  const {
    localePath, localeStructure,
  } = combinedConfig
  if (isNode && !process.browser) {
    const fs = eval("require('fs')")
    const path = require('path')

    const getAllNamespaces = p => fs.readdirSync(p).map(file => file.replace('.json', ''))
    const {
      allLanguages, defaultLanguage,
    } = combinedConfig

    combinedConfig = {
      ...combinedConfig,
      preload: allLanguages,
      ns: getAllNamespaces(path.join(process.cwd(), `${localePath}/${defaultLanguage}`)),
    }

    let { loadPath, addPath } = combinedConfig.backend
    if (typeof loadPath === 'undefined') {
      loadPath = path.join(localePath, `${localeStructure}.json`)
    }
    combinedConfig.backend.loadPath = path.join(process.cwd(), loadPath)

    if (typeof addPath === 'undefined') {
      addPath = path.join(localePath, `${localeStructure}.missing.json`)
    }
    combinedConfig.backend.addPath = path.join(process.cwd(), addPath)
  } else {
    if (typeof combinedConfig.backend.loadPath === 'undefined') {
      combinedConfig.backend.loadPath = `/${localePath}/${localeStructure}.json`
    }

    if (typeof combinedConfig.backend.addPath === 'undefined') {
      combinedConfig.backend.addPath = `/${localePath}/${localeStructure}.missing.json`
    }
  }

  return combinedConfig

}
