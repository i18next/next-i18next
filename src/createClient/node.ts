import i18n from 'i18next'
import i18nextFSBackend from 'i18next-fs-backend'

import { InternalConfig, CreateClientReturn, InitPromise } from '../types'

export default (config: InternalConfig): CreateClientReturn => {
  let initPromise: InitPromise

  if (!i18n.isInitialized) {
    const hasCustomBackend = config?.use?.some((b) => b.type === 'backend')
    if (!hasCustomBackend) {
      i18n.use(i18nextFSBackend)
    }

    config?.use?.forEach(x => i18n.use(x))
    initPromise = i18n.init(config)
  } else {
    if (i18n.language !== config.lng) {
      // prevents a next.js warning: "Text content did not match" #1063
      i18n.changeLanguage(config.lng)
    }
    initPromise = Promise.resolve(i18n.t)
  }

  return { i18n, initPromise }
}
