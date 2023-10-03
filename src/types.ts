/* tslint:disable no-explicit-any */
import {
  I18nContext,
  useTranslation,
  Trans,
  withTranslation,
  WithTranslation as ReactI18nextWithTranslation,
  Translation,
} from 'react-i18next'
import {
  InitOptions,
  i18n as I18NextClient,
  TFunction as I18NextTFunction,
  TypeOptions,
} from 'i18next'
import { appWithTranslation } from './'

/**
 * Inlined from `import('next').NextConfig.i18n` v13.0.6. As we support
 * multiple nextjs versions it's safer to inline and keep it up-to-date.
 */
type NextJsI18NConfig = {
  defaultLocale: string
  domains?: {
    defaultLocale: string
    domain: string
    http?: true
    locales?: string[]
  }[]
  localeDetection?: false
  locales: string[]
}

type DefaultNamespace = TypeOptions['defaultNS']

export type UserConfig = {
  i18n: NextJsI18NConfig
  localeExtension?: string
  localePath?:
    | string
    | ((
        locale: string,
        namespace: string,
        missing: boolean
      ) => string)
  localeStructure?: string
  onPreInitI18next?: (i18n: I18n) => void
  reloadOnPrerender?: boolean
  serializeConfig?: boolean
  use?: any[]
} & InitOptions

export type InternalConfig = Omit<UserConfig, 'i18n'> &
  NextJsI18NConfig & {
    errorStackTraceLimit: number
    preload: string[]
    supportedLngs: string[]
  }

export type UseTranslation = typeof useTranslation
export type AppWithTranslation = typeof appWithTranslation
export type TFunction = I18NextTFunction
export type I18n = I18NextClient
export type WithTranslationHocType = typeof withTranslation
export type WithTranslation = ReactI18nextWithTranslation
export type InitPromise = Promise<TFunction>
export type CreateClientReturn = {
  i18n: I18n
  initPromise: InitPromise
}

export type SSRConfig = {
  _nextI18Next?: {
    initialI18nStore: any
    initialLocale: string
    ns: string[]
    userConfig: UserConfig | null
  }
}

export {
  I18nContext,
  appWithTranslation,
  useTranslation,
  Trans,
  Translation,
  withTranslation,
  DefaultNamespace,
}
