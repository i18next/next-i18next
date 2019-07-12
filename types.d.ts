import * as React from 'react';
import {
  useTranslation,
  TransProps,
  Namespace,
  withTranslation,
  WithTranslation
} from 'react-i18next';
import { LinkProps } from 'next-server/link';
import { SingletonRouter } from 'next-server/router';
import i18next from 'i18next';

export type InitConfig = {
  browserLanguageDetection?: boolean;
  serverLanguageDetection?: boolean;
  strictMode?: boolean;
  defaultLanguage: string;
  ignoreRoutes?: string[];
  localePath?: string;
  localeStructure?: string;
  otherLanguages: string[];
  localeSubpaths?: "none" | "foreign" | "all";
  use?: any[];
  customDetectors?: any[];
} & i18next.InitOptions;

export type Config = {
  fallbackLng: boolean;
  allLanguages: string[];
  whitelist: string[];
  preload: string[];
} & InitConfig;

declare class NextI18Next {
  Trans: React.ComponentClass<TransProps>;
  Link: React.ComponentClass<LinkProps>;
  Router: SingletonRouter;
  i18n: i18next.i18n;
  config: Config;
  useTranslation: typeof useTranslation;

  constructor(config: InitConfig);

  withTranslation: typeof withTranslation;

  appWithTranslation<P extends object>(Component: React.ComponentType<P> | React.ElementType<P>): any;
}

export type TFunction = i18next.TFunction;
export type I18n = i18next.i18n;
export type WithTranslation = WithTranslation;

export default NextI18Next;
