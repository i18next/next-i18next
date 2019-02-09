import { withNamespaces } from 'react-i18next'

import createConfig from './config/create-config'
import createI18NextClient from './create-i18next-client'

import { appWithTranslation, withConfig } from './hocs'
import { consoleMessage } from './utils'
import { Link, Trans } from './components'

export default class NextI18Next {

  constructor(userConfig) {
    this.config = createConfig(userConfig)
    this.consoleMessage = consoleMessage.bind(this)

    /* Validation */
    if (this.config.otherLanguages.length <= 0) {
      throw new Error('To properly initialise a next-i18next instance you must provide one or more locale codes in config.otherLanguages.')
    }

    this.i18n = createI18NextClient(this.config)
    this.appWithTranslation = appWithTranslation.bind(this)
    this.withNamespaces = withNamespaces

    const nextI18NextConfig = { config: this.config, i18n: this.i18n }
    this.Trans = withConfig(Trans, nextI18NextConfig)
    this.Link = withConfig(Link, nextI18NextConfig)
  }

}
