import './global.css'

import { dir } from 'i18next'
import { initServerI18next, getT, getResources } from 'next-i18next/server'
import { I18nProvider } from 'next-i18next/client'
import i18nConfig from '../i18n.config'

initServerI18next(i18nConfig)

export async function generateMetadata() {
  const { t } = await getT()
  return {
    title: t('title'),
    description: 'A playground to explore new Next.js app directory features such as nested layouts, instant loading states, streaming, and component level data fetching.'
  }
}

export default async function RootLayout({ children }) {
  const { t, i18n, lng } = await getT()
  const resources = getResources(i18n)

  return (
    <I18nProvider language={lng} resources={resources}>
      <html lang={lng} dir={dir(lng)}>
        <head />
        <body>
          {children}
        </body>
      </html>
    </I18nProvider>
  )
}
