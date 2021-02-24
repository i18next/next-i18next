import i18n from 'i18next'

import { InternalConfig, CreateClientReturn, InitPromise } from '../../types'

export default (config: InternalConfig): CreateClientReturn => {
  const instance = i18n.createInstance(config)
  let initPromise: InitPromise

  if (!instance.isInitialized) {
    config.use.forEach(x => instance.use(x))
    initPromise = instance.init(config)
  }

  return { i18n: instance, initPromise }
}
