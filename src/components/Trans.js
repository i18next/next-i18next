import React from 'react'
import { Trans, withNamespaces } from 'react-i18next'

class WrappedTrans extends React.Component {
  render() {
    const { i18n } = this.props

    return (
      <Trans {...this.props} i18n={i18n} />
    )
  }
}

export default withNamespaces()(WrappedTrans)
