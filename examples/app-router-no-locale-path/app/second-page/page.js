import Link from 'next/link'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { getT } from 'next-i18next/server'

export default async function Page() {
  const { t } = await getT('second-page')
  return (
    <>
      <main>
        <Header heading={t('h1')} />
        <Link href="/">
          <button type="button">
            {t('back-to-home')}
          </button>
        </Link>
      </main>
      <Footer path="/second-page" />
    </>
  )
}
