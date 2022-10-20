import Link from 'next/link'
import type { GetStaticProps, InferGetStaticPropsType } from 'next'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

type Props = {
  // Add custom props here
}

const SecondPage = (_props: InferGetStaticPropsType<typeof getStaticProps>) => {

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

// or getServerSideProps: GetServerSideProps<Props> = async ({ locale })
export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    ...await serverSideTranslations(locale ?? 'en', ['second-page', 'footer']),
  },
})

export default SecondPage
