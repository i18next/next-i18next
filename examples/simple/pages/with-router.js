import React from 'react'
import PropTypes from 'prop-types'

import { withTranslation, withRouter } from '../i18n'

import Header from '../components/Header'
import Footer from '../components/Footer'

const Homepage = ({ t, router }) => (
  <React.Fragment>
    <main>
      <Header title={t('h1')} />
      <div>
        <button
          type='button'
          onClick={() => router.push('/')}
        >
          {t('back-to-home')}
        </button>
      </div>
    </main>
    <Footer />
  </React.Fragment>
)

Homepage.getInitialProps = async () => ({
  namespacesRequired: ['with-router', 'footer'],
})

Homepage.propTypes = {
  t: PropTypes.func.isRequired,
}

export default withTranslation('with-router')(withRouter(Homepage))
