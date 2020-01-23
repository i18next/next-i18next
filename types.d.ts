/* tslint:disable no-explicit-any */

import * as React from 'react'
import {
  useTranslation,
  TransProps,
  withTranslation,
  WithTranslation as ReactI18nextWithTranslation
} from 'react-i18next'
import { LinkProps } from 'next/link'
import { SingletonRouter } from 'next/router'
import { InitOptions, i18n, TFunction as I18NextTFunction } from 'i18next'
import { NextComponentType, NextPageContext } from 'next-server/dist/lib/utils'
import { WithRouterProps } from 'next/dist/client/with-router'

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

export type UseRouterHook = () => SingletonRouter

export type WithRouterHoC = <P extends WithRouterProps, C = NextPageContext>(ComposedComponent: NextComponentType<C, any, P>) => React.ComponentType<Pick<P, Exclude<keyof P, "router">>>

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
