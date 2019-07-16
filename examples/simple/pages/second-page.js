import React from 'react'
import PropTypes from 'prop-types'

import { withTranslation, Link } from '../i18n'

import Header from '../components/Header'
import Footer from '../components/Footer'

const SecondPage = ({ t }) => (
  <React.Fragment>
    <main>
      <Header title={t('h1')} />
      <Link href='/'>
        <button
          type='button'
        >
          {t('back-to-home')}
        </button>
      </Link>
    </main>
    <Footer />
  </React.Fragment>
)

SecondPage.getInitialProps = async () => ({
  namespacesRequired: ['second-page', 'footer'],
})

SecondPage.propTypes = {
  t: PropTypes.func.isRequired,
}

export default withTranslation('second-page')(SecondPage)
