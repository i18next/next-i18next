import i18n from 'i18next'

import { InternalConfig, CreateClientReturn, InitPromise } from '../types'

export default (config: InternalConfig): CreateClientReturn => {
  if (config.ns === undefined) config.ns = []
  const instance = i18n.createInstance(config)
  let initPromise: InitPromise

  if (!instance.isInitialized) {
    config?.use?.forEach(x => instance.use(x))
    if (typeof config.onPreInitI18next === 'function') {
      config.onPreInitI18next(instance)
    }
    initPromise = instance.init(config)
  } else {
    initPromise = Promise.resolve(i18n.t)
  }

  return { i18n: instance, initPromise }
}
