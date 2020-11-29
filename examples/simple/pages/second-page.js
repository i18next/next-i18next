import Link from 'next/link'

import { withTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Header from '../components/Header'
import Footer from '../components/Footer'

const SecondPage = ({ t }) => (
  <>
    <main>
      <Header title={t('h1')} />
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

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...await serverSideTranslations(locale, ['second-page', 'footer']),
  }
})

export default withTranslation('second-page')(SecondPage)
