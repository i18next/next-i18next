import Link from 'next/link'
import { useRouter } from 'next/router'
import type { GetStaticProps, InferGetStaticPropsType } from 'next'

import { useTranslation, Trans } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

type Props = {
  // Add custom props here
}

const Homepage = (
  _props: InferGetStaticPropsType<typeof getStaticProps>
) => {
  const router = useRouter()
  const { t, i18n } = useTranslation('common')

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onToggleLanguageClick = (newLocale: string) => {
    const { pathname, asPath, query } = router
    router.push({ pathname, query }, asPath, { locale: newLocale })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const clientSideLanguageChange = (newLocale: string) => {
    i18n.changeLanguage(newLocale);
  }

  const changeTo = router.locale === 'en' ? 'de' : 'en'
  // const changeTo = i18n.resolvedLanguage === 'en' ? 'de' : 'en'

  return (
    <>
      <main>
        <Header heading={t('h1')} title={t('title')} />
        <div style={{ display: 'inline-flex', width: '90%' }}>
          <div style={{ width: '33%' }}>
            <h3 style={{ minHeight: 70 }}>
              {t('blog.appDir.question')}
            </h3>
            <p>
              <Trans i18nKey="blog.appDir.answer">
                Then check out
                <a href={t('blog.appDir.link')}>this blog post</a>
                .
              </Trans>
            </p>
            <a href={t('blog.appDir.link')}>
              <img
                style={{ width: '50%' }}
                src="https://locize.com/blog/next-app-dir-i18n/next-app-dir-i18n.jpg"
              />
            </a>
          </div>
          <div style={{ width: '33%' }}>
            <h3 style={{ minHeight: 70 }}>
              {t('blog.optimized.question')}
            </h3>
            <p>
              <Trans i18nKey="blog.optimized.answer">
                Then you may have a look at
                <a href={t('blog.optimized.link')}>this blog post</a>
                .
              </Trans>
            </p>
            <a href={t('blog.optimized.link')}>
              <img
                style={{ width: '50%' }}
                src="https://locize.com/blog/next-i18next/next-i18next.jpg"
              />
            </a>
          </div>
          <div style={{ width: '33%' }}>
            <h3 style={{ minHeight: 70 }}>
              {t('blog.ssg.question')}
            </h3>
            <p>
              <Trans i18nKey="blog.ssg.answer">
                Then you may have a look at
                <a href={t('blog.ssg.link')}>this blog post</a>.
              </Trans>
            </p>
            <a href={t('blog.ssg.link')}>
              <img
                style={{ width: '50%' }}
                src="https://locize.com/blog/next-i18n-static/title.jpg"
              />
            </a>
          </div>
        </div>
        <hr style={{ marginTop: 20, width: '90%' }} />
        <div>
          <Link href="/" locale={changeTo}>
            <button>{t('change-locale', { changeTo })}</button>
          </Link>
          {/* alternative language change without using Link component
          <button onClick={() => onToggleLanguageClick(changeTo)}>
            {t('change-locale', { changeTo })}
          </button>
          */}
          {/* alternative language change without using Link component, but this will change language only on client side
          <button onClick={() => clientSideLanguageChange(changeTo)}>
            {t('change-locale', { changeTo })}
          </button> */}
          <Link href="/second-page">
            <button type="button">{t('to-second-page')}</button>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}

// or getServerSideProps: GetServerSideProps<Props> = async ({ locale })
export const getStaticProps: GetStaticProps<Props> = async ({
  locale,
}) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', [
      'common',
      'footer',
    ])),
  },
})

export default Homepage
