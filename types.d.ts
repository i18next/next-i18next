import * as React from 'react';
import { TransProps } from 'react-i18next';
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

declare class NextI18Next {
  Trans: React.ComponentClass<TransProps>;
  Link: React.ComponentClass<LinkProps>;
  Router: SingletonRouter;
  i18n: i18next.i18n;

  constructor(config: Partial<INextI18NextConfig>);

  withNamespaces(namespace: string | string[]): any;

  appWithTranslation<P extends object>(Component: React.ComponentType<P>): any;
}

export default NextI18Next;