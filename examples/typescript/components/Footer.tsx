import React from 'react'

import { withNamespaces } from '../i18n'

const Footer: React.FunctionComponent = ({ t }) => (
  <footer>{t('description')}</footer>
)

export default withNamespaces('footer')(Footer)
