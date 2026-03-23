import { getT } from 'next-i18next/server'
import Link from 'next/link'
import { FooterServer } from '../components/FooterServer'

export default async function SecondPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const { t } = await getT('second-page', { lng: locale })

  return (
    <>
      <main>
        <h2>next-i18next</h2>
        <h1>{t('h1')}</h1>
        <p style={{ opacity: 0.65, fontStyle: 'italic' }}>App Router (Server Component)</p>
        <div>
          <Link href={`/app-router/${locale}`}>
            <button type="button">{t('back-to-home')}</button>
          </Link>
        </div>
      </main>
      <FooterServer locale={locale} />
    </>
  )
}
