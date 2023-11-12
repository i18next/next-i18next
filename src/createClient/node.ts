import i18n, { Module } from 'i18next'
import i18nextFSBackend from 'i18next-fs-backend'

import {
  InternalConfig,
  CreateClientReturn,
  InitPromise,
  I18n,
} from '../types'

let globalInstance: I18n

export default (config: InternalConfig): CreateClientReturn => {
  if (config.ns === undefined) config.ns = []
  let instance: I18n
  if (!globalInstance) {
    globalInstance = i18n.createInstance(config) as I18n
    instance = globalInstance
  } else {
    instance = globalInstance.cloneInstance({
      ...config,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      initImmediate: false,
    }) as I18n
  }
  let initPromise: InitPromise

  if (!instance.isInitialized) {
    const hasCustomBackend = config?.use?.some(
      (b: Module) => b.type === 'backend'
    )
    if (!hasCustomBackend) {
      instance.use(i18nextFSBackend)
    }

    config?.use?.forEach((x: Module) => instance.use(x))
    if (typeof config.onPreInitI18next === 'function') {
      config.onPreInitI18next(instance)
    }
    initPromise = instance.init(config)
  } else {
    initPromise = Promise.resolve(i18n.t)
  }

  return { i18n: instance, initPromise }
}
