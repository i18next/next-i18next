import React from 'react'

import { Trans, withTranslation } from '../i18n'

class Title extends React.Component {
  render() { // eslint-disable-line class-methods-use-this
    return (
      <h1>
        <Trans i18nKey='h1' />
      </h1>
    )
  }
}

export default withTranslation('common')(Title)
