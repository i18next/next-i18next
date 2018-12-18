import createConfig from 'config/create-config'
import createI18NextClient from 'create-i18next-client'

import { appWithTranslation } from 'hocs'
import { Link } from 'components'
import { withNamespaces } from 'react-i18next'

export default class NextI18Next {

  constructor(userConfig) {
    this.config = createConfig(userConfig)
    this.i18n = createI18NextClient(this.config)
    this.appWithTranslation = appWithTranslation.bind(this)
    this.withNamespaces = withNamespaces

    this.Link = Link.apply(this)
  }

}
