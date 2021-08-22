import path from 'path'
import fs from 'fs'
import type { FallbackLng } from 'i18next'
import { I18NextHMRPlugin } from 'i18next-hmr/plugin'
import { NextConfig } from 'next/dist/next-server/server/config-shared'

import { defaultConfig } from './config/defaultConfig'
import { UserConfig } from './types'

const unique = (list: string[]) => Array.from(new Set<string>(list))

const getLocaleNamespaces = (path: string, localeExtension: string) =>
  fs.readdirSync(path).map(
    (file: string) => file.replace(`.${localeExtension}`, '')
  )

const getNamespaces = ({
  locales,
  localeExtension,
  serverLocalePath,
}: {
  localeExtension: string
  locales: string[]
  serverLocalePath: string
}): string[] => {
  const namespacesByLocale = locales
    .map(locale => getLocaleNamespaces(
      path.resolve(process.cwd(), `${serverLocalePath}/${locale}`),
      localeExtension,
    ))

  const allNamespaces = []
  for (const localNamespaces of namespacesByLocale) {
    allNamespaces.push(...localNamespaces)
  }

  return unique(allNamespaces)
}

const getAllLocales = (
  lng: string,
  fallbackLng: false | FallbackLng
): string[] => {
  if (typeof fallbackLng === 'string') {
    return unique([lng, fallbackLng])
  }

  if (Array.isArray(fallbackLng)) {
    return unique([lng, ...fallbackLng])
  }

  if (typeof fallbackLng === 'object') {
    const flattenedFallbacks = Object
      .values(fallbackLng)
      .reduce(((all, fallbackLngs) => [ ...all, ...fallbackLngs ]),[])
    return unique([ lng, ...flattenedFallbacks ])
  }
  return [lng]
}

export const withHmrNextConfig = (i18n: UserConfig & UserConfig['i18n']) => (
  (nextConfig: NextConfig = {} as NextConfig): NextConfig => {
    if (process.env.NODE_ENV === 'production') {
      return Object.assign({}, nextConfig, { i18n })
    }
    const localePath = i18n.localePath || defaultConfig.localePath
    const namespaces = i18n.ns || getNamespaces({
      localeExtension:
        i18n.localeExtension || defaultConfig.localeExtension,
      locales: getAllLocales(
        i18n.defaultLocale,
        i18n.fallbackLng || i18n.defaultLocale
      ),
      serverLocalePath: localePath,
    })
    return Object.assign({}, nextConfig, {
      i18n,
      publicRuntimeConfig: {
        ...nextConfig.publicRuntimeConfig,
        __HMR_I18N_ENABLED__: true,
        __HMR_I18N_NAMESPACES__: namespaces,
      },
      webpack: (config: any, options: any) => {
        if (!options.isServer && config.mode === 'development') {
          const localePath = i18n.localePath || defaultConfig.localePath
          config.plugins.push(
            new I18NextHMRPlugin({
              localesDir: path.resolve(process.cwd(), localePath),
            })
          )
        }
        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, options)
        }
        return config
      },
    })
  }
)
