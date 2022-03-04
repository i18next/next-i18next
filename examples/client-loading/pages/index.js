import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

const Homepage = () => {

  const router = useRouter()
  const { t } = useTranslation('common')
  const [counter, setCounter] = useState(1)

  useEffect(() => {
    if (router.query.counter) {
      setCounter(parseInt(router.query.counter))
    }
  },[router.query.counter])

  const updateShallowRoute = () => {
    router.push(`/?counter=${counter + 1}`, undefined, {shallow: true})
  }

  return (
    <>
      <main>
        <Header heading={t('h1')} title={t('title')} />
        <div>
          <Link
            href='/'
            locale={router.locale === 'en' ? 'de' : 'en'}
          >
            <button>
              {t('change-locale')}
            </button>
          </Link>
          <Link href='/second-page'>
            <button
              type='button'
            >
              {t('to-second-page')}
            </button>
          </Link>
          <Link href='/client-page'>
            <button
              type='button'
            >
              {t('to-client-page')}
            </button>
          </Link>
          <button
            type='button'
            onClick={updateShallowRoute}
          >
            {t('shallow-route', {counter: counter + 1})}
          </button>
        </div>
      </main>
      <Footer />
    </>
  )
}

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...await serverSideTranslations(locale, ['common', 'footer']),
  },
})

export default Homepage
