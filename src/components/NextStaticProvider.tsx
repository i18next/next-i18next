import React from 'react'
import PropTypes from 'prop-types'

import { withTranslation } from 'react-i18next'

interface Props {
  tReady: boolean;
}

class NextStaticProvider extends React.Component<Props> {
  static propTypes = {
    children: PropTypes.node.isRequired,
    tReady: PropTypes.bool,
  }

  static defaultProps = {
    tReady: true,
  }
  render() {
    const { children, tReady } = this.props
    return tReady ? children : null
  }
}

export default withTranslation()(NextStaticProvider as any)
