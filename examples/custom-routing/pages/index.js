import React from 'react'
import PropTypes from 'prop-types'

import { i18n, Link, withNamespaces } from '../i18n'

import Title from '../components/Title'
import Footer from '../components/Footer'

class Homepage extends React.Component {
  static async getInitialProps() {
    return {
      namespacesRequired: ['common', 'footer'],
    }
  }

  render() {
    const { t } = this.props

    return (
      <React.Fragment>
        <Title />
        <button
          type='button'
          onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'de' : 'en')}
        >
          {t('change-locale')}
        </button>
        <Link href='/second-page'>
          <button
            type='button'
          >
            {t('to-second-page')}
          </button>
        </Link>
        {
          [1, 2, 3].map(
            productId => (
              <React.Fragment key={productId}>
                <br />
                <Link
                  href={`/product-page?id=${productId}`}
                  as={`/products/${productId}`}
                >
                  <button
                    type='button'
                  >
                    {t(`common:product${productId}`)}
                  </button>
                </Link>
              </React.Fragment>
            ),
          )
        }
        <Footer />
      </React.Fragment>
    )
  }
}

Homepage.propTypes = {
  t: PropTypes.func.isRequired,
}

export default withNamespaces(['common', 'footer'])(Homepage)
