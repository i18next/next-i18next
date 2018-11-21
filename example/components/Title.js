import React from 'react'
import { withNamespaces } from '../i18n'

class Title extends React.Component {
  render() {
    return (
      <h1>{this.props.t('h1')}</h1>
    )
  }
}

export default withNamespaces('common')(Title)
