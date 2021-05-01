import { useTranslation } from 'next-i18next'

import { Header } from './Header'
import { Footer } from './Footer'

export const Fallback = () => {
  const { t, ready } = useTranslation('fallback')

  return (
    <>
      <main>
        <Header heading={ready ? t('h1') : ''} title={ready ? t('title') : ''} />
      </main>
      <Footer />
    </>
  )
}
