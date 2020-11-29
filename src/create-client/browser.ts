import i18n from 'i18next'
import i18nextHTTPBackend from 'i18next-http-backend/cjs'
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector'

import { InitPromise } from '../../types'

export default (config) => {
  const instance = i18n.createInstance(config)

  let initPromise: InitPromise

  if (!instance.isInitialized) {
    instance.use(i18nextHTTPBackend)
    if (config.browserLanguageDetection) {
      const browserDetectors = new I18nextBrowserLanguageDetector()
      config.customDetectors.forEach(detector => browserDetectors.addDetector(detector))
      instance.use(browserDetectors)
    }

    config.use.forEach(x => instance.use(x))
    initPromise = instance.init(config)
  }
  return { i18n: instance, initPromise }
}
