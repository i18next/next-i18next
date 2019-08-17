/* tslint:disable no-explicit-any */

import * as React from 'react'
import {
  useTranslation,
  TransProps,
  withTranslation,
  WithTranslation
} from 'react-i18next'
import { LinkProps } from 'next/link'
import { SingletonRouter } from 'next/router'
import i18next from 'i18next'

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
} & i18next.InitOptions

export type Config = {
  fallbackLng: boolean;
  allLanguages: string[];
  whitelist: string[];
  preload: string[];
} & InitConfig

export type Trans = (props: TransProps) => any
export type Link = React.ComponentClass<LinkProps>
export type Router = SingletonRouter
export type UseTranslation = typeof useTranslation
export type AppWithTranslation = <P extends object>(Component: React.ComponentType<P> | React.ElementType<P>) => any
export type TFunction = i18next.TFunction
export type I18n = i18next.i18n
export type WithTranslationHocType = typeof withTranslation
export type WithTranslation = WithTranslation

declare class NextI18Next {
  constructor(config: InitConfig);
  Trans: Trans
  Link: Link
  Router: Router
  i18n: I18n
  config: Config
  useTranslation: UseTranslation
  withTranslation: WithTranslationHocType
  appWithTranslation: AppWithTranslation
}

declare global {
  namespace Express {
    interface Request {
      i18n?: I18n & {
        options: Config;
      };
      lng?: string;
    }
  }
}

export default NextI18Next
