import i18n, { Module } from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import fs from 'fs'

import {
  InternalConfig,
  CreateClientReturn,
  InitPromise,
  I18n,
} from '../types'

function createFSBackend(config: InternalConfig) {
  return resourcesToBackend((lng: string, ns: string) => {
    const backend = config.backend as Record<string, any> | undefined
    let filePath: string
    if (typeof backend?.loadPath === 'function') {
      filePath = backend.loadPath(lng, ns)
    } else if (typeof backend?.loadPath === 'string') {
      filePath = backend.loadPath
        .replace('{{lng}}', lng)
        .replace('{{ns}}', ns)
    } else {
      filePath = `./public/locales/${lng}/${ns}.json`
    }
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  })
}

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

      // @ts-ignore
      initAsync: false,

      // @ts-ignore
      initImmediate: false, // i18next < 24
    }) as I18n
  }
  let initPromise: InitPromise

  if (!instance.isInitialized) {
    const plugins = config?.use?.filter(Boolean) ?? []
    const hasCustomBackend = plugins.some(
      (b: Module) => b.type === 'backend'
    )
    if (!hasCustomBackend) {
      instance.use(createFSBackend(config))
    }

    plugins.forEach((x: Module) => instance.use(x))
    if (typeof config.onPreInitI18next === 'function') {
      config.onPreInitI18next(instance)
    }
    initPromise = instance.init(config)
  } else {
    initPromise = Promise.resolve(i18n.t)
  }

  return { i18n: instance, initPromise }
}
