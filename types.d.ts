/* tslint:disable no-explicit-any */

import * as React from 'react'
import {
  I18nContext,
  useTranslation,
  TransProps,
  withTranslation,
  WithTranslation as ReactI18nextWithTranslation
} from 'react-i18next'
import { InitOptions, i18n, TFunction as I18NextTFunction } from 'i18next'

export type InitConfig = {
  strictMode?: boolean;
  defaultLocale: string;
  localeExtension?: string;
  localePath?: string;
  localeStructure?: string;
  locales: string[];
  use?: any[];
  shallowRender?: boolean;
} & InitOptions

export type Config = {
  errorStackTraceLimit: number
  fallbackLng: boolean;
  supportedLngs: string[];
  // temporal backwards compatibility WHITELIST REMOVAL
  whitelist: string[];
  // end temporal backwards compatibility WHITELIST REMOVAL
  preload: string[];
} & InitConfig

export type NextI18NextInternals = {
  config: Config;
  i18n: I18n;
}

export type Trans = (props: TransProps) => any
export type UseTranslation = typeof useTranslation
export type AppWithTranslation = <P extends unknown>(Component: React.ComponentType<P> | React.ElementType<P>) => any
export type TFunction = I18NextTFunction
export type I18n = i18n
export type WithTranslationHocType = typeof withTranslation
export type WithTranslation = ReactI18nextWithTranslation
export type InitPromise = Promise<TFunction>
export type CreateClientReturn = {
  i18n: I18n;
  initPromise: InitPromise;
}

export type SSRConfig = {
  _nextI18Next: {
    initialI18nStore: any;
    initialLocale: string;
    userConfig: Config;
  };
}

export {
  I18nContext,
  withTranslation,
}

declare class NextI18Next {
  constructor(config: InitConfig);
  Trans: Trans
  i18n: I18n
  initPromise: InitPromise
  config: Config
  useTranslation: UseTranslation
  withTranslation: WithTranslationHocType
  appWithTranslation: AppWithTranslation
}

export default NextI18Next
