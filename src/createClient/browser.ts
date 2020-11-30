import i18n from 'i18next'
import i18nextHTTPBackend from 'i18next-http-backend/cjs'

import { Config, CreateClientReturn, InitPromise } from '../../types'

export default (config: Config): CreateClientReturn => {
  const instance = i18n.createInstance(config)

  let initPromise: InitPromise

  if (!instance.isInitialized) {
    instance.use(i18nextHTTPBackend)
    config.use.forEach(x => instance.use(x))
    initPromise = instance.init(config)
  }
  return { i18n: instance, initPromise }
}
