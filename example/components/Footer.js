import React from 'react'
import { withNamespaces } from '../i18n'

class Footer extends React.Component {
  render() {
    return (
      <footer>{this.props.t('description')}</footer>
    )
  }
}

export default withNamespaces('footer')(Footer)
