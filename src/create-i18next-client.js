import isNode from 'detect-node'
import i18next from 'i18next'
import i18nextXHRBackend from 'i18next-xhr-backend'
import i18nextBrowserLanguageDetector from 'i18next-browser-languagedetector'

const i18n = i18next.default ? i18next.default : i18next
i18n.nsFromReactTree = []

export default (config) => {
  if (!i18n.isInitialized) {

    if (isNode) {
      const i18nextNodeBackend = eval("require('i18next-node-fs-backend')")
      const i18nextMiddleware = eval("require('i18next-express-middleware')")
      i18n.use(i18nextNodeBackend)
      i18n.use(i18nextMiddleware.LanguageDetector)
    } else {
      i18n.use(i18nextXHRBackend)
      if (config.browserLanguageDetection) {
        i18n.use(i18nextBrowserLanguageDetector)
      }
    }

    config.use.forEach(x => i18n.use(x))
    i18n.init(config)

  }
  return i18n
}
