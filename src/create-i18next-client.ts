import isNode from 'detect-node'
import i18n from 'i18next'
import i18nextXHRBackend from 'i18next-xhr-backend'
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector'
import serverI18nSetup from './middlewares/i18n-setup'

export default (config) => {
  if (!i18n.isInitialized) {

    if (isNode) {
      serverI18nSetup(i18n, config);
    } else {
      i18n.use(i18nextXHRBackend)
      if (config.browserLanguageDetection) {
        const browserDetectors = new I18nextBrowserLanguageDetector()
        config.customDetectors.forEach(detector => browserDetectors.addDetector(detector))
        i18n.use(browserDetectors)
      }
    }

    config.use.forEach(x => i18n.use(x))
    i18n.init(config)

  }
  return i18n
}
