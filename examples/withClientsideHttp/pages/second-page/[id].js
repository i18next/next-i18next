
import Link from 'next/link'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { Fallback } from '../../components/Fallback'
import { useRouter } from 'next/dist/client/router'

const SecondPagePost = ({params}) => {
  const { t } = useTranslation('second-page')
  const router = useRouter()

  if (router.isFallback) {
    return (
      <Fallback />
    )
  }

  return (
    <>
      <main>
        <h2>{params.id}</h2>
        <Header heading={t('h1')} title={t('title')} />
        <Link href='/'>
          <button
            type='button'
          >
            {t('back-to-home')}
          </button>
        </Link>
      </main>
      <Footer />
    </>
  )
}

export const getStaticProps = async ({locale, params}) => ({
  props: {
    params,
    ...await serverSideTranslations(locale, ['second-page', 'footer']),
  },
})

export const getStaticPaths = async () => ({
  fallback: true,
  paths: [
    {params: {id: '1'}},
    {params: {id: '2'}},
  ],
})

export default SecondPagePost
