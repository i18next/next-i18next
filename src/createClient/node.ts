import i18n from 'i18next'
import i18nextFSBackend from 'i18next-fs-backend/cjs'

import { InternalConfig, CreateClientReturn, InitPromise } from '../../types'

export default (config: InternalConfig): CreateClientReturn => {
  const instance = i18n.createInstance(config)
  let initPromise: InitPromise

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
