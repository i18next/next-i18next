import React from 'react'

import { withNamespaces } from '../i18n'


const Error: React.FunctionComponent = ({ statusCode = null, t }) => (
  <p>
    {statusCode
      ? t('error-with-status', { statusCode })
      : t('error-without-status')}
  </p>
)

Error.getInitialProps = ({ res, err }) => {
  let statusCode = null
  if (res) {
    ({ statusCode } = res)
  } else if (err) {
    ({ statusCode } = err)
  }
  return {
    namespacesRequired: ['common'],
    statusCode,
  }
}

export default withNamespaces('common')(Error)
