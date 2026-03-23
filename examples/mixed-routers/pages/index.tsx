import Link from 'next/link'
import { useRouter } from 'next/router'
import type { GetStaticProps, InferGetStaticPropsType } from 'next'

import { useTranslation, Trans } from 'next-i18next/pages'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'

import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

type Props = {
  // Add custom props here
}

const Homepage = (
  _props: InferGetStaticPropsType<typeof getStaticProps>
) => {
  const router = useRouter()
  const { t } = useTranslation('common')
  const changeTo = router.locale === 'en' ? 'de' : 'en'

  return (
    <>
      <main>
        <Header heading={t('h1')} title={t('title')} />
        <p className="subtitle">{t('description')}</p>
        <p className="router-badge">Pages Router</p>

        <div className="featured-card">
          <h3 className="card-title">
            {t('blog.v16.question')}
          </h3>
          <p className="card-text">
            <Trans i18nKey="blog.v16.answer">
              Check out
              <a href={t('blog.v16.link')}>the blog post</a> for the full story.
            </Trans>
          </p>
          <a href={t('blog.v16.link')}>
            <img
              className="card-img"
              src="https://www.locize.com/img/blog/next-i18next-v16/title.jpg"
              alt="next-i18next v16"
            />
          </a>
        </div>

        <div className="mainBox">
          <div className="card">
            <h3 className="card-title">
              {t('blog.appDir.question')}
            </h3>
            <p className="card-text">
              <Trans i18nKey="blog.appDir.answer">
                Then check out
                <a href={t('blog.appDir.link')}>this blog post</a>.
              </Trans>
            </p>
            <a href={t('blog.appDir.link')}>
              <img
                className="card-img"
                src="https://www.locize.com/img/blog/i18n-next-app-router/i18n-next-app-router.jpg"
                alt="i18n next app router"
              />
            </a>
          </div>

          <div className="card">
            <h3 className="card-title">
              {t('blog.optimized.question')}
            </h3>
            <p className="card-text">
              <Trans i18nKey="blog.optimized.answer">
                Then you may have a look at
                <a href={t('blog.optimized.link')}>this blog post</a>
                .
              </Trans>
            </p>
            <a href={t('blog.optimized.link')}>
              <img
                className="card-img"
                src="https://www.locize.com/img/blog/next-i18next/next-i18next.jpg"
                alt="next-i18next optimized"
              />
            </a>
          </div>
          <div className="card">
            <h3 className="card-title">{t('blog.ssg.question')}</h3>
            <p className="card-text">
              <Trans i18nKey="blog.ssg.answer">
                Then you may have a look at
                <a href={t('blog.ssg.link')}>this blog post</a>.
              </Trans>
            </p>
            <a href={t('blog.ssg.link')}>
              <img
                className="card-img"
                src="https://www.locize.com/img/blog/next-i18n-static/title.jpg"
                alt="next-i18n static"
              />
            </a>
          </div>
        </div>
        <hr style={{ marginTop: 20, width: '90%' }} />
        <div>
          <Link href="/" locale={changeTo}>
            <button>{t('change-locale', { changeTo })}</button>
          </Link>
          <Link href="/second-page">
            <button type="button">{t('to-second-page')}</button>
          </Link>
          <a href={`/app-router/${router.locale}`}>
            <button type="button">{t('to-app-router')}</button>
          </a>
        </div>
      </main>
      <Footer />
    </>
  )
}

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
