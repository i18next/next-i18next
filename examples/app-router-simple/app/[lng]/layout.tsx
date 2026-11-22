import './global.css'

import { dir } from 'i18next'
import { I18nProvider } from 'next-i18next/client'
import { getT, getResources, generateI18nStaticParams } from '@/i18n.server'

export async function generateStaticParams() {
  return generateI18nStaticParams()
}

export async function generateMetadata() {
  const { t } = await getT()
  return {
    title: t('title'),
    content: 'A playground to explore new Next.js app directory features such as nested layouts, instant loading states, streaming, and component level data fetching.'
  }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lng: string; }>;
}) {
  const { lng } = await params
  const { i18n } = await getT()
  const resources = getResources(i18n)

  return (
    <html lang={lng} dir={dir(lng)}>
      <head />
      <body>
        <I18nProvider language={lng} resources={resources}>
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}
