import { defaultConfig } from './defaultConfig'
import { InternalConfig, UserConfig } from '../types'
import { unique } from '../utils'
import { FallbackLngObjList, Module } from 'i18next'

const deepMergeObjects = ['backend', 'detection'] as (keyof Pick<
  UserConfig,
  'backend' | 'detection'
>)[]

type CreateConfigOptions = {
  // Hook called only on the server side. Kept as an injected dependency so
  // `createConfig` itself never references Node built-ins (`fs`, `path`,
  // `module`) and stays safe to bundle for the browser. Wired up by
  // `serverSideTranslations`, which is server-only.
  applyServerSideConfig?: (
    combinedConfig: any,
    userConfig: UserConfig
  ) => void
}

export const createConfig = (
  userConfig: UserConfig,
  options: CreateConfigOptions = {}
): InternalConfig => {
  if (typeof userConfig?.lng !== 'string') {
    throw new Error('config.lng was not passed into createConfig')
  }

  //
  // Initial merge of default and user-provided config
  //
  const { i18n: userI18n, ...userConfigStripped } = userConfig
  const { i18n: defaultI18n, ...defaultConfigStripped } =
    defaultConfig
  const combinedConfig = {
    ...defaultConfigStripped,
    ...userConfigStripped,
    ...defaultI18n,
    ...userI18n,
  }

  const {
    defaultNS,
    lng,
    localeExtension,
    localePath,
    nonExplicitSupportedLngs,
  } = combinedConfig

  const locales = combinedConfig.locales.filter((l: string) => l !== 'default')

  /**
   * Skips translation file resolution while in cimode
   * https://github.com/i18next/next-i18next/pull/851#discussion_r503113620
   */
  if (lng === 'cimode') {
    return combinedConfig as unknown as InternalConfig
  }

  if (typeof combinedConfig.fallbackLng === 'undefined') {
    combinedConfig.fallbackLng = combinedConfig.defaultLocale
    if (combinedConfig.fallbackLng === 'default') { [combinedConfig.fallbackLng] = locales }
  }

  const userPrefix = userConfig?.interpolation?.prefix
  const userSuffix = userConfig?.interpolation?.suffix
  const prefix = userPrefix ?? '{{'
  const suffix = userSuffix ?? '}}'
  if (
    typeof userConfig?.localeStructure !== 'string' &&
    (userPrefix || userSuffix)
  ) {
    combinedConfig.localeStructure = `${prefix}lng${suffix}/${prefix}ns${suffix}`
  }

  const { fallbackLng, localeStructure } = combinedConfig

  if (nonExplicitSupportedLngs) {
    const createFallbackObject = (
      acc: FallbackLngObjList,
      l: string
    ) => {
      const [locale] = l.split('-')
      acc[l] = [locale]
      return acc
    }

    if (typeof fallbackLng === 'string') {
      combinedConfig.fallbackLng = combinedConfig.locales
        .filter((l: string) => l.includes('-'))
        .reduce(createFallbackObject, { default: [fallbackLng] })
    } else if (Array.isArray(fallbackLng)) {
      combinedConfig.fallbackLng = combinedConfig.locales
        .filter((l: string) => l.includes('-'))
        .reduce(createFallbackObject, { default: fallbackLng })
    } else if (typeof fallbackLng === 'object') {
      combinedConfig.fallbackLng = Object.entries(
        combinedConfig.fallbackLng
      ).reduce<FallbackLngObjList>((acc, [l, f]: [string, any]) => {
        acc[l] = l.includes('-')
          ? unique([l.split('-')[0], ...f])
          : f
        return acc
      }, fallbackLng as FallbackLngObjList)
    } else if (typeof fallbackLng === 'function') {
      throw new Error(
        'If nonExplicitSupportedLngs is true, no functions are allowed for fallbackLng'
      )
    }
  }

  const hasCustomBackend = userConfig?.use?.filter(Boolean).some(
    (b: Module) => b.type === 'backend'
  )
  if (!process.browser && typeof window === 'undefined') {
    if (options.applyServerSideConfig) {
      options.applyServerSideConfig(combinedConfig, userConfig)
    }
  } else {
    //
    // Set client side backend, if there is no custom backend
    //
    if (!hasCustomBackend) {
      if (typeof localePath === 'string') {
        combinedConfig.backend = {
          addPath: `${localePath}/${localeStructure}.missing.${localeExtension}`,
          loadPath: `${localePath}/${localeStructure}.${localeExtension}`,
        }
      } else if (typeof localePath === 'function') {
        combinedConfig.backend = {
          addPath: (locale: string, namespace: string) =>
            localePath(locale, namespace, true),
          loadPath: (locale: string, namespace: string) =>
            localePath(locale, namespace, false),
        }
      }
    }

    if (
      typeof combinedConfig.ns !== 'string' &&
      !Array.isArray(combinedConfig.ns)
    ) {
      combinedConfig.ns = [defaultNS as string]
    }
  }

  //
  // Deep merge with overwrite - goes last
  //
  deepMergeObjects.forEach(obj => {
    if (userConfig[obj]) {
      combinedConfig[obj] = {
        ...combinedConfig[obj],
        ...userConfig[obj],
      }
    }
  })

  return combinedConfig as unknown as InternalConfig
}
