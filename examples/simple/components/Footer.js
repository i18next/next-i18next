import React from 'react'
import PropTypes from 'prop-types'

import { withTranslation } from '../i18n'

class Footer extends React.Component {
  render() {
    const { t } = this.props
    return (
      <footer>{t('description')}</footer>
    )
  }
}

Footer.propTypes = {
  t: PropTypes.func.isRequired,
}

export default withTranslation('footer')(Footer)
