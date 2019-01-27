import React from 'react'
import PropTypes from 'prop-types'

import { withNamespaces, Link } from '../i18n'

class SecondPage extends React.Component {

  static async getInitialProps() {
    return {
      namespacesRequired: ['second-page'],
    }
  }

  render() {
    const { t } = this.props
    return (
      <React.Fragment>
        <h1>{t('h1')}</h1>
        <Link href='/'>
          <button
            type='button'
          >
            {t('back-to-home')}
          </button>
        </Link>
      </React.Fragment>
    )
  }
}

SecondPage.propTypes = {
  t: PropTypes.func.isRequired,
}

export default withNamespaces('second-page')(SecondPage)
