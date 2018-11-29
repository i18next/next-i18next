import isNode from 'detect-node'
import i18next from 'i18next'
import i18nextXHRBackend from 'i18next-xhr-backend'
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector'

const i18n = i18next.default ? i18next.default : i18next
i18n.nsFromReactTree = []

export default (config) => {
  if (!i18n.isInitialized) {
    if (isNode) {
      const i18nextNodeBackend = eval("require('i18next-node-fs-backend')") // eslint-disable-line
      const I18nextMiddleware = require('i18next-express-middleware')

      const serverLanguageDetector = new I18nextMiddleware.LanguageDetector()

      config.detection.serverDetectors.forEach((detector) => {
        serverLanguageDetector.addDetector(detector)
      })
      i18n.use(i18nextNodeBackend).use(serverLanguageDetector)
    } else {
      const browserLanguageDetector = new I18nextBrowserLanguageDetector()

      config.detection.browserDetectors.forEach((detector) => {
        browserLanguageDetector.addDetector(detector)
      })
      i18n.use(i18nextXHRBackend).use(browserLanguageDetector)
    }

    i18n.init(config)
  }
  return i18n
}
