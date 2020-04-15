/* tslint:disable no-explicit-any */

import * as React from 'react'
import {
  useTranslation,
  TransProps,
  withTranslation,
  WithTranslation as ReactI18nextWithTranslation
} from 'react-i18next'
import { LinkProps } from 'next/link'
import { Request } from 'express'
import { SingletonRouter } from 'next/router'
import { InitOptions, i18n, TFunction as I18NextTFunction } from 'i18next'

export type InitConfig = {
  browserLanguageDetection?: boolean;
  serverLanguageDetection?: boolean;
  strictMode?: boolean;
  defaultLanguage: string;
  ignoreRoutes?: string[];
  localePath?: string;
  localeStructure?: string;
  otherLanguages: string[];
  localeSubpaths?: Record<string, string>;
  use?: any[];
  customDetectors?: any[];
  shallowRender?: boolean;
} & InitOptions

export type Config = {
  fallbackLng: boolean;
  allLanguages: string[];
  whitelist: string[];
  preload: string[];
} & InitConfig

export interface NextI18NextInternals {
  config: Config;
  i18n: I18n;
}

export type Trans = (props: TransProps) => any
export type Link = React.ComponentClass<LinkProps>
export type Router = SingletonRouter
export type UseTranslation = typeof useTranslation
export type AppWithTranslation = <P extends object>(Component: React.ComponentType<P> | React.ElementType<P>) => any
export type TFunction = I18NextTFunction
export type I18n = i18n
export type WithTranslationHocType = typeof withTranslation
export type WithTranslation = ReactI18nextWithTranslation
export type InitPromise = Promise<TFunction>

declare class NextI18Next {
  constructor(config: InitConfig);
  Trans: Trans
  Link: Link
  Router: Router
  i18n: I18n
  initPromise: InitPromise
  config: Config
  useTranslation: UseTranslation
  withTranslation: WithTranslationHocType
  appWithTranslation: AppWithTranslation
}

export type NextI18NextRequest = Request & {
  i18n?: I18n & {
    options: Config;
  };
  lng?: string;
}

export default NextI18Next
