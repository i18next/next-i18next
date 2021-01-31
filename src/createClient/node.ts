import i18n from 'i18next'
import i18nextFSBackend from 'i18next-fs-backend/cjs'

import { Config, CreateClientReturn, InitPromise } from '../../types'

export default (config: Config): CreateClientReturn => {
  const instance = i18n.createInstance(config)
  let initPromise: InitPromise

  if (!instance.isInitialized) {
    const hasCustomBackend = config.use && config.use.some((b) => b.type === 'backend')
    if(!hasCustomBackend)
      instance.use(i18nextFSBackend)

    config.use.forEach(x => instance.use(x))
    initPromise = instance.init(config)
  }
  return { i18n: instance, initPromise }
}
