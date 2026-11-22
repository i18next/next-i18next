// Same props as I18nProvider from next-i18next/client, with i18next-icu registered
import { I18nProvider } from 'next-i18next/icu'
import { getT, getResources, generateI18nStaticParams } from '@/i18n.server'

export async function generateStaticParams() {
  return generateI18nStaticParams()
}

export async function generateMetadata() {
  const { t } = await getT()
  return { title: t('title') }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lng: string }>
}) {
  const { lng } = await params
  const { i18n } = await getT()

  return (
    <html lang={lng}>
      <body>
        <I18nProvider language={lng} resources={getResources(i18n)}>
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}
