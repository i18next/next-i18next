import React from 'react'
import { Trans, withNamespaces } from '../i18n'

const Title: React.FunctionComponent = () => (
  <h1>
    <Trans i18nKey='h1' />
  </h1>
)

export default withNamespaces('common')(Title)
