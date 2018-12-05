import defaultConfig from 'config/default-config'
import isNode from 'detect-node'

export default (userConfig) => {

  let combinedConfig = {
    ...defaultConfig,
    ...userConfig,
  }

  combinedConfig.allLanguages = combinedConfig.otherLanguages
    .concat([combinedConfig.defaultLanguage])
  combinedConfig.load = combinedConfig.load


  if (isNode && !process.browser) {
    const fs = eval("require('fs')") // eslint-disable-line
    const path = require('path')

    const getAllNamespaces = p => fs.readdirSync(p).map(file => file.replace('.json', ''))
    const {
      allLanguages, defaultLanguage, fallbackLng, localePath, localeStructure, load,
    } = combinedConfig

    combinedConfig = {
      ...combinedConfig,
      load,
      preload: allLanguages,
      fallbackLng,
      ns: getAllNamespaces(path.join(process.cwd(), `${localePath}/${defaultLanguage}`)),
      backend: {
        loadPath: path.join(process.cwd(), `${localePath}/${localeStructure}.json`),
        addPath: path.join(process.cwd(), `${localePath}/${localeStructure}.missing.json`),
      },
    }
  }

  return combinedConfig

}
