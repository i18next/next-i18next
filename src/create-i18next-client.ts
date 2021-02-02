import i18n from 'i18next'
import i18nextHTTPBackend from 'i18next-http-backend/cjs'
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector'

import { InitPromise } from '../types'

export default (config) => {
  let initPromise: InitPromise

  if (!i18n.isInitialized) {

    if (!process.browser) {
      const i18nextFSBackend = require('i18next-fs-backend/cjs')
      const i18nextMiddleware = require('i18next-http-middleware/cjs')
      i18n.use(i18nextFSBackend)
      if (config.serverLanguageDetection) {
        const serverDetectors = new i18nextMiddleware.LanguageDetector()
        config.customDetectors.forEach(detector => serverDetectors.addDetector(detector))
        i18n.use(serverDetectors)
      }
    } else {
      i18n.use(i18nextHTTPBackend)
      if (config.browserLanguageDetection) {
        const browserDetectors = new I18nextBrowserLanguageDetector()
        config.customDetectors.forEach(detector => browserDetectors.addDetector(detector))
        i18n.use(browserDetectors)
      }
    }

    config.use.forEach(x => i18n.use(x))
    initPromise = i18n.init(config)

  }
  return { i18n, initPromise }
}
