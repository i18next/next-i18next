import React from 'react'
import { i18n, withNamespaces } from '../i18n'

import Title from '../components/Title'
import Footer from '../components/Footer'

class Homepage extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Title />
        <button onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'de' : 'en')}>
          {this.props.t('change-locale')}
        </button>
        <Footer />
      </React.Fragment>
    )
  }
}

export default withNamespaces('common')(Homepage)
