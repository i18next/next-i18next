import Link from 'next/link'
import { useRouter } from 'next/router'

import { withTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Header from '../components/Header'
import Footer from '../components/Footer'

const Homepage = ({ t }) => {
  const router = useRouter()
  return (
    <>
      <main>
        <Header title={t('h1')} />
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
        </div>
      </main>
      <Footer />
    </>
  )
}

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...await serverSideTranslations(locale, ['common', 'footer']),
  }
})

export default withTranslation('common')(Homepage)
