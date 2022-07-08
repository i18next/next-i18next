import Link from 'next/link'
import { useRouter } from 'next/router'

import { useTranslation, Trans } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

const Homepage = () => {

  const router = useRouter()
  const { t } = useTranslation('common')

  return (
    <>
      <main>
        <Header heading={t('h1')} title={t('title')} />
        <div style={{ display: 'inline-flex', width: '90%' }}>
          <div style={{ width: '50%' }}>
            <h3 style={{ minHeight: 70 }}>{t('blog.optimized.question')}</h3>
            <p>
              <Trans i18nKey='blog.optimized.answer'>
                Then you may have a look at <a href='https://locize.com/blog/next-i18next/'>this blog post</a>.
              </Trans>
            </p>
            <a href='https://locize.com/blog/next-i18next/'>
              <img style={{ width: '50%' }} src='https://locize.com/blog/next-i18next/next-i18next.jpg' />
            </a>
          </div>
          <div style={{ width: '50%' }}>
            <h3 style={{ minHeight: 70 }}>{t('blog.ssg.question')}</h3>
            <p>
              <Trans i18nKey='blog.ssg.answer'>
                Then you may have a look at <a href='https://locize.com/blog/next-i18n-static/'>this blog post</a>.
              </Trans>
            </p>
            <a href='https://locize.com/blog/next-i18n-static/'>
              <img style={{ width: '50%' }} src='https://locize.com/blog/next-i18n-static/title.jpg' />
            </a>
          </div>
        </div>
        <hr style={{ marginTop: 20, width: '90%' }} />
        <div>
          <Link
            href='/'
            locale={router.locale === 'en' ? 'de' : 'en'}
          >
            <button>
              {t('change-locale', { changeTo: router.locale === 'en' ? 'de' : 'en' })}
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
  },
})

export default Homepage
