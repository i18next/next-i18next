import React from 'react'
import PropTypes from 'prop-types'
import { withNamespaces, Link } from '../i18n'

class ProductPage extends React.Component {
  static async getInitialProps({ query: { id } }) {
    return {
      id: parseInt(id, 10),
      namespacesRequired: ['product-page', 'common'],
    }
  }

  render() {
    const { id, t } = this.props

    return (
      <React.Fragment>
        <h1>{t('h1')}</h1>
        <h2>{t(`common:product${id}`)}</h2>
        <Link href='/'>
          <button
            type='button'
          >
            {t('common:back-to-home')}
          </button>
        </Link>
      </React.Fragment>
    )
  }
}

ProductPage.propTypes = {
  id: PropTypes.number.isRequired,
  t: PropTypes.func.isRequired,
}

export default withNamespaces(['product-page', 'common'])(ProductPage)
