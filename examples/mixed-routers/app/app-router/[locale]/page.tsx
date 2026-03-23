import { Trans } from 'react-i18next/TransWithoutContext'
import { getT } from 'next-i18next/server'
import Link from 'next/link'
import { FooterServer } from './components/FooterServer'

export default async function AppRouterHome({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const { t, i18n } = await getT('common', { lng: locale })
  const changeTo = locale === 'en' ? 'de' : 'en'

  return (
    <>
      <main>
        <h2>
          next-i18next
          <hr />
        </h2>
        <h1>{t('h1')}</h1>
        <p className="subtitle">{t('description')}</p>
        <p className="router-badge">App Router (Server Component)</p>
        <a className="github" href="https://github.com/i18next/next-i18next">
          <i className="typcn typcn-social-github-circular" />
        </a>

        <div className="featured-card">
          <h3 className="card-title">
            {t('blog.v16.question')}
          </h3>
          <p className="card-text">
            <Trans i18nKey="blog.v16.answer" t={t} i18n={i18n}>
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
              <Trans i18nKey="blog.appDir.answer" t={t} i18n={i18n}>
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
              <Trans i18nKey="blog.optimized.answer" t={t} i18n={i18n}>
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
              <Trans i18nKey="blog.ssg.answer" t={t} i18n={i18n}>
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
          <Link href={`/app-router/${changeTo}`}>
            <button>{t('change-locale', { changeTo })}</button>
          </Link>
          <Link href={`/app-router/${locale}/second-page`}>
            <button type="button">{t('to-second-page')}</button>
          </Link>
          <a href={`/${locale}`}>
            <button type="button">{t('to-pages-router')}</button>
          </a>
        </div>
      </main>
      <FooterServer locale={locale} />
    </>
  )
}
