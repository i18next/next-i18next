import React from 'react'
import { Trans } from 'react-i18next'

export default function () {

  const { i18n } = this

  return class WrappedTrans extends React.Component {
    render() {
      return (
        <Trans {...this.props} i18n={i18n} />
      )
    }
  }

}
