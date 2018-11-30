import React from 'react'
import PropTypes from 'prop-types'

import { withNamespaces } from 'react-i18next'

class NextStaticProvider extends React.Component {
  render() {
    const { children, tReady } = this.props
    return tReady ? children : null
  }
}

NextStaticProvider.propTypes = {
  children: PropTypes.node.isRequired,
  tReady: PropTypes.bool.isRequired,
}

export default withNamespaces()(NextStaticProvider)
