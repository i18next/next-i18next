import React from 'react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

const ErrorPage = () => {
  const { t } = useTranslation()

  return (
    <p>
      {t('error-without-status')}
    </p>
  )
}

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...await serverSideTranslations(locale, ['common']),
  },
})

export default ErrorPage
