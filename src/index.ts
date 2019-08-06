import { withTranslation, useTranslation, Trans } from 'react-i18next'
import hoistNonReactStatics from 'hoist-non-react-statics'

import createConfig from './config/create-config'
import createI18NextClient from './create-i18next-client'

import { appWithTranslation, withInternals } from './hocs'
import { consoleMessage } from './utils'
import { Link } from './components';
import { wrapRouter } from './router';

import { AppWithTranslation, Config, InitConfig, Trans as TransType, Link as LinkType, I18n, UseTranslation, WithTranslation, Router } from '../types'

export { withTranslation } from 'react-i18next'

export default class NextI18Next {
  readonly Trans: TransType;
  readonly Link: LinkType;
  readonly Router: Router;
  readonly i18n: I18n;
  readonly config: Config;
  readonly useTranslation: UseTranslation;
  readonly withTranslation: WithTranslation;
  readonly appWithTranslation: AppWithTranslation;

  readonly consoleMessage: () => void
  readonly withNamespaces: () => void

  constructor(userConfig: InitConfig) {
    this.config = createConfig(userConfig)
    this.consoleMessage = consoleMessage.bind(this)

    /* Validation */
    if (this.config.otherLanguages.length <= 0) {
      throw new Error('To properly initialise a next-i18next instance you must provide one or more locale codes in config.otherLanguages.')
    }
    this.withNamespaces = () => {
      throw new Error('next-i18next has upgraded to react-i18next v10 - please rename withNamespaces to withTranslation.')
    }

    this.i18n = createI18NextClient(this.config)
    this.appWithTranslation = appWithTranslation.bind(this)
    this.withTranslation = (namespace, options) => Component => hoistNonReactStatics(
      withTranslation(namespace, options)(Component), Component)

    const nextI18NextInternals = { config: this.config, i18n: this.i18n }
    this.Link = withInternals(Link, nextI18NextInternals) as LinkType
    this.Router = wrapRouter(nextI18NextInternals)

    /* Directly export `react-i18next` methods */
    this.Trans = Trans
    this.useTranslation = useTranslation
  }

}
