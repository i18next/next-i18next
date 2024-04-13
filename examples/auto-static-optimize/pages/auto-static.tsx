import Link from 'next/link'

import { useTranslation } from 'next-i18next'

import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

const StaticPage = () => {
  const { t } = useTranslation([
    'common',
    'second-page',
    'staticpage',
  ])

  return (
    <>
      <main>
        <Header
          heading={t('second-page:h1')}
          title={t('second-page:title')}
        />
        <h2>{t('h1')}</h2>
        <h2>{t('staticpage:hi')}</h2>
        <Link href="/">
          <button type="button">
            {t('second-page:back-to-home')}
          </button>
        </Link>
      </main>
      <Footer />
    </>
  )
}

StaticPage._nextI18Next = {
  ns: ['common', 'second-page', 'staticpage', 'footer'],
}

export default StaticPage
