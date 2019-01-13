import React from 'react'
import { i18n, Link, withNamespaces } from '../i18n'

import Title from '../components/Title'
import Footer from '../components/Footer'

class Homepage extends React.Component {
  static async getInitialProps() {
    return {
      namespacesRequired: ['common', 'footer', 'products']
    }
  }

  render() {
    const { t } = this.props

    return (
      <React.Fragment>
        <Title />
        <button onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'de' : 'en')}>
          {t('change-locale')}
        </button>
        <Link href='/second-page'>
          <a>{t('to-second-page')}</a>
        </Link>
        {
          [1, 2, 3].map(
            productId => <React.Fragment key={productId}>
              <br />
              <Link
                href={`/product-page?id=${productId}`}
                as={`/products/${productId}`}
              >
                <a>{t(`products:product${productId}`)}</a>
              </Link>
            </React.Fragment>
          )
        }
        <Footer />
      </React.Fragment>
    )
  }
}

export default withNamespaces(['common', 'footer', 'products'])(Homepage)
