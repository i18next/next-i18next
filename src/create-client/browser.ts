import i18n from 'i18next'
import i18nextHTTPBackend from 'i18next-http-backend/cjs'
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector'

import { InitPromise } from '../../types'

export default (config) => {
  let initPromise: InitPromise

  if (!i18n.isInitialized) {
    i18n.use(i18nextHTTPBackend)
    if (config.browserLanguageDetection) {
      const browserDetectors = new I18nextBrowserLanguageDetector()
      config.customDetectors.forEach(detector => browserDetectors.addDetector(detector))
      i18n.use(browserDetectors)
    }

    config.use.forEach(x => i18n.use(x))
    initPromise = i18n.init(config)
  }
  return { i18n, initPromise }
}
