/* tslint:disable no-explicit-any */

import React from 'react'
import {
  I18nContext,
  Trans,
  useTranslation,
  withTranslation,
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

export type SSRConfig = {
  _nextI18Next: {
    initialI18nStore: any;
    initialLocale: string;
    userConfig: Config;
  };
}
export type UseTranslation = typeof useTranslation
export type AppWithTranslation = <P extends unknown>(Component: React.ComponentType<P> | React.ElementType<P>) => any
export type InitPromise = Promise<TFunction>
export type TFunction = I18NextTFunction
export type I18n = i18n
export type CreateClientReturn = {
  i18n: I18n;
  initPromise: InitPromise;
}

declare function appWithTranslation<P extends object>(
  Component: React.ComponentType<P> | React.ElementType<P>
): any
declare function serverSideTranslations(
  initialLocale: string,
  namespacesRequired?: string[],
  configOverride?: Config,
): Promise<SSRConfig>

export {
  I18nContext,
  Trans,
  useTranslation,
  withTranslation,
  appWithTranslation,
  serverSideTranslations,
}
