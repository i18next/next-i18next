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
      const prefix = config.interpolation?.prefix ?? '{{'
      const suffix = config.interpolation?.suffix ?? '}}'
      filePath = backend.loadPath
        .replace(`${prefix}lng${suffix}`, lng)
        .replace(`${prefix}ns${suffix}`, ns)
    } else {
      filePath = `./public/locales/${lng}/${ns}.json`
    }
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  })
}

// One shared instance per serverInstanceKey (e.g. a tenant), `undefined` being the default.
// Each keeps its store and backend (and the backend's reload timer) for the life of the
// process, so keys must come from a known, bounded set.
const rootInstances = new Map<string | undefined, I18n>()

export default (config: InternalConfig): CreateClientReturn => {
  if (config.ns === undefined) config.ns = []
  let instance: I18n
  const rootInstance = rootInstances.get(config.serverInstanceKey)
  if (!rootInstance) {
    instance = i18n.createInstance(config) as I18n
    rootInstances.set(config.serverInstanceKey, instance)
  } else {
    instance = rootInstance.cloneInstance({
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
