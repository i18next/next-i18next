import i18n from 'i18next'
import i18nextFSBackend from 'i18next-fs-backend/cjs'
import i18nextMiddleware from 'i18next-http-middleware/cjs'

import { InitPromise } from '../../types'

export default (config) => {
  let initPromise: InitPromise

  if (!i18n.isInitialized) {
    i18n.use(i18nextFSBackend)
    if (config.serverLanguageDetection) {
      const serverDetectors = new i18nextMiddleware.LanguageDetector()
      config.customDetectors.forEach(detector => serverDetectors.addDetector(detector))
      i18n.use(serverDetectors)
    }

    config.use.forEach(x => i18n.use(x))
    initPromise = i18n.init(config)
  }
  return { i18n, initPromise }
}
