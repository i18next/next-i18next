import Link from 'next/link'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

import nextI18NextConfig from '../next-i18next.config.js'

type Props = {
  // Add custom props here
}

const SecondPage = (_props: InferGetServerSidePropsType<typeof getServerSideProps>) => {

  const { t } = useTranslation(['common', 'second-page'])

  return (
    <>
      <main>
        <Header heading={t('second-page:h1')} title={t('second-page:title')} />
        <Link href='/'>
          <button
            type='button'
          >
            {t('second-page:back-to-home')}
          </button>
        </Link>
      </main>
      <Footer />
    </>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const locale = context.locale ?? nextI18NextConfig.i18n.defaultLocale
  return {
    props: {
      ...await serverSideTranslations(locale, ['second-page', 'footer'], nextI18NextConfig),
    },
  }
}

export default SecondPage
