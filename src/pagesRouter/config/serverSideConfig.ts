import fs from 'fs'
import path from 'path'

import { InternalConfig, UserConfig } from '../types'
import { getFallbackForLng, unique } from '../utils'
import { Module } from 'i18next'

// Server-only logic extracted from createConfig so that the bundler never
// traces `fs`/`path` from the client side. createConfig invokes this via the
// `applyServerSideConfig` hook, which is wired up only by callers that are
// guaranteed to run on the server (e.g. serverSideTranslations).
export const applyServerSideConfig = (
  combinedConfig: any,
  userConfig: UserConfig
): void => {
  const {
    defaultNS,
    lng,
    localeExtension,
    localePath,
    localeStructure,
    fallbackLng,
  } = combinedConfig

  const userPrefix = userConfig?.interpolation?.prefix
  const userSuffix = userConfig?.interpolation?.suffix
  const prefix = userPrefix ?? '{{'
  const suffix = userSuffix ?? '}}'

  const locales: string[] = combinedConfig.locales.filter(
    (l: string) => l !== 'default'
  )

  combinedConfig.preload = locales

  const hasCustomBackend = userConfig?.use?.filter(Boolean).some(
    (b: Module) => b.type === 'backend'
  )
  if (hasCustomBackend) return

  //
  // Validate defaultNS
  // https://github.com/i18next/next-i18next/issues/358
  //
  if (typeof defaultNS === 'string' && typeof lng !== 'undefined') {
    if (typeof localePath === 'string') {
      const defaultLocaleStructure = localeStructure
        .replace(`${prefix}lng${suffix}`, lng)
        .replace(`${prefix}ns${suffix}`, defaultNS)
      const defaultFile = `/${defaultLocaleStructure}.${localeExtension}`
      const defaultNSPath = path.join(localePath, defaultFile)
      const defaultNSExists = fs.existsSync(defaultNSPath)
      const fallback = getFallbackForLng(lng, fallbackLng)
      const defaultFallbackNSExists = fallback.some(f => {
        const fallbackFile = defaultFile.replace(lng, f)
        return fs.existsSync(path.join(localePath, fallbackFile))
      })
      if (
        !defaultNSExists &&
        !defaultFallbackNSExists &&
        process.env.NODE_ENV !== 'production'
      ) {
        throw new Error(`Default namespace not found at ${defaultNSPath}`)
      }
    } else if (typeof localePath === 'function') {
      const defaultNSPath = localePath(lng, defaultNS, false)
      const defaultNSExists = fs.existsSync(defaultNSPath)
      const fallback = getFallbackForLng(lng, fallbackLng)
      const defaultFallbackNSExists = fallback.some(f => {
        const fallbackNSPath = localePath(f, defaultNS, false)
        return fs.existsSync(fallbackNSPath)
      })
      if (
        !defaultNSExists &&
        !defaultFallbackNSExists &&
        process.env.NODE_ENV !== 'production'
      ) {
        throw new Error(`Default namespace not found at ${defaultNSPath}`)
      }
    }
  }

  //
  // Set server side backend
  //
  if (typeof localePath === 'string') {
    combinedConfig.backend = {
      addPath: path.resolve(
        process.cwd(),
        `${localePath}/${localeStructure}.missing.${localeExtension}`
      ),
      loadPath: path.resolve(
        process.cwd(),
        `${localePath}/${localeStructure}.${localeExtension}`
      ),
    }
  } else if (typeof localePath === 'function') {
    combinedConfig.backend = {
      addPath: (locale: string, namespace: string) =>
        localePath(locale, namespace, true),
      loadPath: (locale: string, namespace: string) =>
        localePath(locale, namespace, false),
    }
  } else if (localePath) {
    throw new Error(`Unsupported localePath type: ${typeof localePath}`)
  }

  //
  // Set server side preload (namespaces)
  //
  if (!combinedConfig.ns && typeof lng !== 'undefined') {
    if (typeof localePath === 'function') {
      throw new Error(
        'Must provide all namespaces in ns option if using a function as localePath'
      )
    }

    const getNamespaces = (loc: string[]): string[] => {
      const getLocaleNamespaces = (p: string): string[] => {
        let ret: string[] = []
        if (!fs.existsSync(p)) return ret
        fs.readdirSync(p).forEach((file: string) => {
          const joinedP = path.join(p, file)
          if (fs.statSync(joinedP).isDirectory()) {
            const subRet = getLocaleNamespaces(joinedP).map(
              n => `${file}/${n}`
            )
            ret = ret.concat(subRet)
            return
          }
          ret.push(file.replace(`.${localeExtension}`, ''))
        })
        return ret
      }

      let namespacesByLocale: string[][]
      const r = combinedConfig.resources
      if (!localePath && r) {
        namespacesByLocale = loc.map(locale => Object.keys(r[locale]))
      } else {
        namespacesByLocale = loc.map(locale =>
          getLocaleNamespaces(
            path.resolve(process.cwd(), `${localePath}/${locale}`)
          )
        )
      }

      const allNamespaces: string[] = []
      for (const localNamespaces of namespacesByLocale) {
        allNamespaces.push(...localNamespaces)
      }

      return unique(allNamespaces)
    }

    if (
      localeStructure.indexOf(`${prefix}lng${suffix}`) >
      localeStructure.indexOf(`${prefix}ns${suffix}`)
    ) {
      throw new Error(
        'Must provide all namespaces in ns option if using a localeStructure that is not namespace-listable like lng/ns'
      )
    }

    combinedConfig.ns = getNamespaces(
      unique([lng, ...getFallbackForLng(lng, fallbackLng)])
    ) as InternalConfig['ns']
  }
}
