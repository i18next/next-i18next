import isNode from 'detect-node'
import i18next from 'i18next'
import i18nextXHRBackend from 'i18next-xhr-backend'
import i18nextBrowserLanguageDetector from 'i18next-browser-languagedetector'

const i18n = i18next.default ? i18next.default : i18next
i18n.nsFromReactTree = []

if (isNode) {
  const i18nextNodeBackend = require('i18next-node-fs-backend')
  const i18nextMiddleware = require('i18next-express-middleware')
  i18n.use(i18nextNodeBackend).use(i18nextMiddleware.LanguageDetector)
} else {
  i18n.use(i18nextXHRBackend).use(i18nextBrowserLanguageDetector)
}

export default (config) => {
  i18n.init(config)
  return i18n
}
