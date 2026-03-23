import Link from 'next/link'
import { Trans } from 'react-i18next/TransWithoutContext'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { getT } from 'next-i18next/server'

export default async function Page() {
  const { t, i18n } = await getT()
  return (
    <>
      <main>
        <Header heading={t('h1')} />
        <h2>
          <Trans t={t} i18n={i18n} i18nKey="welcome">
            Welcome to Next.js 16 <small>with the App Router</small> and next-i18next
          </Trans>
        </h2>
        <div style={{ width: '100%' }}>
          <p>
            <Trans t={t} i18n={i18n} i18nKey="blog.text">
              Check out the corresponding <a href={t('blog.link')}>blog post</a> describing this example.
            </Trans>
          </p>
          <a href={t('blog.link')}>
            <img
              style={{ width: '50%' }}
              alt="next-i18next v16 blog post"
              src="https://www.locize.com/img/blog/next-i18next-v16/title.jpg"
            />
          </a>
        </div>
        <hr style={{ marginTop: 20, width: '90%' }} />
        <div>
          <Link href="/second-page">
            <button type="button">{t('to-second-page')}</button>
          </Link>
          <Link href="/client-page">
            <button type="button">{t('to-client-page')}</button>
          </Link>
        </div>
      </main>
      <Footer/>
    </>
  )
}
