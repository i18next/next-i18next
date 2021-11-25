import { defaultConfig } from './defaultConfig'
import { InternalConfig, UserConfig } from '../types'
import { FallbackLng } from 'i18next'

const deepMergeObjects = ['backend', 'detection'] as (keyof Pick<UserConfig, 'backend' | 'detection'>)[]

export const createConfig = (userConfig: UserConfig): InternalConfig => {
  if (typeof userConfig?.lng !== 'string') {
    throw new Error('config.lng was not passed into createConfig')
  }

  //
  // Initial merge of default and user-provided config
  //
  const { i18n: userI18n, ...userConfigStripped } = userConfig
  const { i18n: defaultI18n, ...defaultConfigStripped } = defaultConfig
  const combinedConfig = {
    ...defaultConfigStripped,
    ...userConfigStripped,
    ...defaultI18n,
    ...userI18n,
  }

  const {
    defaultNS,
    lng,
    locales,
    localeExtension,
    localePath,
    localeStructure,
  } = combinedConfig

  /**
   * Skips translation file resolution while in cimode
   * https://github.com/isaachinman/next-i18next/pull/851#discussion_r503113620
  */
  if (lng === 'cimode') {
    return combinedConfig as InternalConfig
  }

  const prefix = userConfig?.interpolation?.prefix ?? '{{'
  const suffix = userConfig?.interpolation?.suffix ?? '}}'
  const lngPlaceholder = `${prefix}lng${suffix}`
  const nsPlaceholder = `${prefix}ns${suffix}`

  if (typeof combinedConfig.fallbackLng === 'undefined') {
    combinedConfig.fallbackLng = combinedConfig.defaultLocale
  }
  const hasCustomBackend = userConfig?.use?.some((b) => b.type === 'backend')
  if (!process.browser && typeof window === 'undefined') {
    combinedConfig.preload = locales

    if (!hasCustomBackend) {
      const fs = require('fs')
      const path = require('path')
      const serverLocalePath = localePath

      const getFilePath = (base: string): string => {
        const defaultFile = `/${localeStructure}.${localeExtension}`
        return path.join(base, defaultFile)
      }

      const replaceLng = (path: string, lng: string) => path
        .replace(lngPlaceholder, lng)

      const replaceNS = (path: string, ns: string) => path
        .replace(nsPlaceholder, ns)

      const validatePath = (path:string, errorMessage: string) => {
        const defaultNSExists = fs.existsSync(path)
        if (!defaultNSExists && process.env.NODE_ENV !== 'production') {
          throw new Error(errorMessage)
        }
      }

      //
      // Validate defaultNS
      // https://github.com/isaachinman/next-i18next/issues/358
      //
      if (typeof defaultNS === 'string' && typeof lng !== 'undefined') {
        const defaultNSPathNotReplaced = getFilePath(localePath)
        const defaultNSPathLng = replaceLng(defaultNSPathNotReplaced, lng)
        const defaultNSPath = replaceNS(defaultNSPathLng, defaultNS)

        validatePath(defaultNSPath, `Default namespace not found at ${defaultNSPath}`)
      }

      //
      // Set server side backend
      //
      combinedConfig.backend = {
        addPath: path.resolve(process.cwd(), `${serverLocalePath}/${localeStructure}.missing.${localeExtension}`),
        loadPath: path.resolve(process.cwd(), `${serverLocalePath}/${localeStructure}.${localeExtension}`),
      }

      //
      // Set server side preload (namespaces)
      //
      if (!combinedConfig.ns && typeof lng !== 'undefined') {
        const unique = (list: string[]) => Array.from(new Set<string>(list))
        const getNamespaces = (locales: string[]): string[] => {
          const getLocaleNamespaces = (p: string, locale: string) => {
            const filePath = getFilePath(p)
            const filePathLng = replaceLng(filePath, locale)

            const fileDir = path.dirname(filePath)
            const fileDirLng = path.dirname(filePathLng)

            validatePath(fileDirLng, `Namespace can not be a folder [${fileDirLng}]`)

            const nsFiles = fs.readdirSync(fileDirLng)
            const nsFilesWithoutExt = nsFiles.map((file:string) => file.replace(`.${localeExtension}`, ''))

            //
            // language is a folder => no need for a replacement in filename
            //
            if (fileDir.match(lngPlaceholder)) {
              return nsFilesWithoutExt
            }

            const fileName = path.basename(filePath, `.${localeExtension}`)
            const fileNameLng = path.basename(filePathLng, `.${localeExtension}`)

            const filePathParts = fileName.split(nsPlaceholder)
            const filePathLngParts = fileNameLng.split(nsPlaceholder)

            let lngPart: string
            filePathParts.forEach((part: string, index: number) => {
              if (part.includes(lngPlaceholder)) {
                lngPart = filePathLngParts[index]
              }
            })

            return nsFilesWithoutExt
              // language is part of filename
              // proceed only with the files matching current locale
              .filter((file: string) => file.includes(lngPart))
              // extract namespace from filename by deleting everything else
              .map((file: string) => {
                for (const part of filePathLngParts) {
                  file = file.replace(part, '')
                }
                return file
              })
          }

          const namespacesByLocale = locales
            .map((locale) => getLocaleNamespaces(path.resolve(process.cwd(), `${serverLocalePath}/`),locale))

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

        combinedConfig.ns = getNamespaces(
          getAllLocales(lng, combinedConfig.fallbackLng)
        )
      }
    }
  } else {

    let clientLocalePath = localePath

    //
    // Remove public prefix from client site config
    //
    if (localePath.match(/^\.?\/public\//)) {
      clientLocalePath = localePath.replace(/^\.?\/public/, '')
    }

    //
    // Set client side backend, if there is no custom backend
    //
    if (!hasCustomBackend) {
      combinedConfig.backend = {
        addPath: `${clientLocalePath}/${localeStructure}.missing.${localeExtension}`,
        loadPath: `${clientLocalePath}/${localeStructure}.${localeExtension}`,
      }
    }

    if (typeof combinedConfig.ns !== 'string' && !Array.isArray(combinedConfig.ns)) {
      combinedConfig.ns = [defaultNS]
    }
  }

  //
  // Deep merge with overwrite - goes last
  //
  deepMergeObjects.forEach((obj) => {
    if (userConfig[obj]) {
      combinedConfig[obj] = {
        ...combinedConfig[obj],
        ...userConfig[obj],
      }
    }
  })

  return combinedConfig as InternalConfig
}
