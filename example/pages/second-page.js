import React from 'react'
import { withNamespaces } from '../i18n'

class SecondPage extends React.Component {
  render() {
    return (
      <React.Fragment>
        <h1>{this.props.t('h1')}</h1>
      </React.Fragment>
    )
  }
}

export default withNamespaces('second-page')(SecondPage)
