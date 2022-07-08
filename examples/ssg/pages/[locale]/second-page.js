import Link from '../../components/Link'

import { useTranslation } from 'next-i18next'
import { getStaticPaths, makeStaticProps } from '../../lib/getStatic'

import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'

const SecondPage = () => {
  const { t } = useTranslation(['second-page', 'common', 'footer'])

  return (
    <>
      <main>
        <Header heading={t('h1')} title={t('title')} />
        <Link href='/'>
          <button
            type='button'
          >
            {t('common:back-to-home')}
          </button>
        </Link>
      </main>
      <Footer />
    </>
  )
}

export default SecondPage

const getStaticProps = makeStaticProps(['second-page', 'common', 'footer'])
export { getStaticPaths, getStaticProps }
