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

export interface INextI18NextConfig {
  browserLanguageDetection: boolean;
  serverLanguageDetection: boolean;
  defaultNS: string;
  defaultLanguage: string;
  ignoreRoutes: string[];
  localePath: string;
  localeStructure: string;
  otherLanguages: string[];
  localeSubpaths: 'none' | 'foreign' | 'all';
  use: any[];
  customDetectors: any[];
}

export interface I18nProps {
  t(key: string, option?: object): string;
}

declare class NextI18Next {
  Trans: React.ComponentClass<TransProps>;
  Link: React.ComponentClass<LinkProps>;
  Router: SingletonRouter;
  i18n: i18next.i18n;

  constructor(config: Partial<INextI18NextConfig>);

  withNamespaces(
    namespace: Namespace | NamespaceExtractor,
    options?: WithNamespacesOptions,
  ): <T extends React.ComponentType<any>>(
    component: T,
  ) => T & (T extends React.ComponentType<infer P> ? React.ComponentType<Subtract<P, I18nProps>> : never);

  appWithTranslation<P extends object>(Component: React.ComponentType<P> | React.ElementType<P>): any;
}

export default NextI18Next;
