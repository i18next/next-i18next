import React from 'react'
import PropTypes from 'prop-types'

import { withTranslation } from 'react-i18next'

class NextStaticProvider extends React.Component {
  render() {
    const { children, tReady } = this.props
    return tReady ? children : null
  }
}

NextStaticProvider.defaultProps = {
  tReady: true,
}
NextStaticProvider.propTypes = {
  children: PropTypes.node.isRequired,
  tReady: PropTypes.bool,
}

export default withTranslation()(NextStaticProvider)
