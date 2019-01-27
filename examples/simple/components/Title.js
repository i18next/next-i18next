import React from 'react'
import { Trans, withNamespaces } from '../i18n'

class Title extends React.Component {
  render() { // eslint-disable-line class-methods-use-this
    return (
      <h1>
        <Trans i18nKey='h1' />
      </h1>
    )
  }
}

export default withNamespaces('common')(Title)
