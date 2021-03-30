import React from 'react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

const ErrorPage = ({ statusCode }) => {
  const { t } = useTranslation()

  return (
    <p>
      {statusCode
        ? t('error-with-status', { statusCode })
        : t('error-without-status')}
    </p>
  )
}

export const getServerSideProps = async ({ locale, res: { statusCode } }) => ({
  props: {
    statusCode,
    ...await serverSideTranslations(locale, ['common']),
  },
})

export default ErrorPage
