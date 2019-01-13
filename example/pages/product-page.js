import React from 'react'
import PropTypes from 'prop-types';
import { withNamespaces, Link } from '../i18n'

class ProductPage extends React.Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    t: PropTypes.func.isRequired
  }

  static async getInitialProps({ query: { id } }) {
    return {
      id: parseInt(id, 10),
      namespacesRequired: ['product-page', 'common']
    }
  }

  render() {
    const { id, t } = this.props

    return (
      <React.Fragment>
        <h1>{t('h1')}</h1>
        <h2>{t(`common:product${id}`)}</h2>
        <Link href='/'>
          <a>{t('common:back-to-home')}</a>
        </Link>
      </React.Fragment>
    )
  }
}

export default withNamespaces(['product-page', 'common'])(ProductPage)
