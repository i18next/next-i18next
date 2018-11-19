import React from 'react'
import { i18n, withNamespaces } from '../i18n'

class Homepage extends React.Component {
  render() {
    return (
      <div>
        <button onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'de' : 'en')}>
          
          {/* This works: */}
          {this.props.t('change-locale', {
            lng: this.props.lng,
          })}

          {/* This does not work: */}
          {/* {this.props.t('change-locale')} */}

        </button>
      </div>
    )
  }
}

export default withNamespaces('common')(Homepage)
