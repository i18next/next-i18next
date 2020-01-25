import React from 'react'
import PropTypes from 'prop-types'

import { withTranslation, useRouter } from '../i18n'

import Header from '../components/Header'
import Footer from '../components/Footer'

const Homepage = ({ t }) => {
  const router = useRouter()

  return (
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
}

Homepage.getInitialProps = async () => ({
  namespacesRequired: ['use-router', 'footer'],
})

Homepage.propTypes = {
  t: PropTypes.func.isRequired,
}

export default withTranslation('use-router')(Homepage)
