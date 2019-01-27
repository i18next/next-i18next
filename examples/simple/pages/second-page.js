import React from 'react'
import { withNamespaces, Link } from '../i18n'

class SecondPage extends React.Component {
  static async getInitialProps() {
    return {
      namespacesRequired: ['second-page']
    }
  }
  render() {
    const { t } = this.props
    return (
      <React.Fragment>
        <h1>{t('h1')}</h1>
        <Link href='/'>
          <a>{t('back-to-home')}</a>
        </Link>
      </React.Fragment>
    )
  }
}

export default withNamespaces('second-page')(SecondPage)
