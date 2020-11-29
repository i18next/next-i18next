import Link from 'next/link'
import { withTranslation, serverSideTranslations } from 'next-i18next'
import nextI18NextConfig from '../next-i18next.config'

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
    ...await serverSideTranslations(locale, nextI18NextConfig, ['second-page', 'footer']),
  }
})

export default withTranslation('second-page')(SecondPage)
