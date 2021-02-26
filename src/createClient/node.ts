import i18n from 'i18next'
import i18nextFSBackend from 'i18next-fs-backend/cjs'

import { InternalConfig, CreateClientReturn, InitPromise } from '../../types'

let instance

export default (config: InternalConfig): CreateClientReturn => {
  let initPromise: InitPromise
  if (instance) {
    // using cloneInstance for subsequent calls,
    // prevents to load the translations again via backend plugin,
    // like in i18next-http-middleware
    let i18nextClone
    initPromise = new Promise((resolve, reject) => {
      i18nextClone = instance.cloneInstance({
        ...config,
        initImmediate: false,
      }, (err, t) => err ? reject(err) : resolve(t))
    })
    return {
      i18n: i18nextClone,
      initPromise,
    }
  }
  instance = i18n.createInstance(config)
  if (!instance.isInitialized) {
    const hasCustomBackend = config?.use?.some((b) => b.type === 'backend')
    if (!hasCustomBackend) {
      instance.use(i18nextFSBackend)
    }

    config.use.forEach(x => instance.use(x))
    initPromise = instance.init(config)
  }
  return { i18n: instance, initPromise }
}
