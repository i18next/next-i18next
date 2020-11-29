import i18n from 'i18next'
import i18nextFSBackend from 'i18next-fs-backend/cjs'

import { InitPromise } from '../../types'

export default (config) => {
  const instance = i18n.createInstance(config)
  let initPromise: InitPromise

  if (!instance.isInitialized) {
    instance.use(i18nextFSBackend)

    config.use.forEach(x => instance.use(x))
    initPromise = instance.init(config)
  }
  return { i18n: instance, initPromise }
}
