import * as React from 'react';
import {
  TransProps,
  Namespace,
  NamespaceExtractor,
  WithNamespacesOptions,
  WithNamespaces,
  Subtract
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

  constructor(config: InitConfig);

  withNamespaces(
    namespace: Namespace | NamespaceExtractor,
    options?: WithNamespacesOptions,
  ): <P>(
    component: React.ComponentType<P>,
  ) => React.ComponentType<Subtract<P, WithNamespaces>>;

  appWithTranslation<P extends object>(Component: React.ComponentType<P> | React.ElementType<P>): any;
}

export default NextI18Next;
