import i18n from 'i18next'
import i18nextHTTPBackend from 'i18next-http-backend/cjs'

import { InitPromise } from '../../types'

export default (config) => {
  let initPromise: InitPromise

  if (!i18n.isInitialized) {
    i18n.use(i18nextHTTPBackend)
    config.use.forEach(x => i18n.use(x))
    initPromise = i18n.init(config)
  }
  return { i18n, initPromise }
}
