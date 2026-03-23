import { initServerI18next, getT, getResources } from 'next-i18next/server'
import { I18nProvider } from 'next-i18next/client'
import i18nConfig from '../../../i18n.config'
import type { ReactNode } from 'react'

initServerI18next(i18nConfig)

export default async function AppRouterLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const { t, i18n } = await getT('common', { lng: locale })
  const resources = getResources(i18n, i18nConfig.ns!)

  return (
    <html lang={locale}>
      <head>
        <title>{t('title')}</title>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.min.css"
          rel="stylesheet"
        />
        <link href="/app.css" rel="stylesheet" />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/typicons/2.0.9/typicons.min.css"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Open+Sans:300,400|Oswald:600"
          rel="stylesheet"
        />
        <link
          data-react-helmet="true"
          rel="icon"
          href="https://blobscdn.gitbook.com/v0/b/gitbook-28427.appspot.com/o/spaces%2F-L9iS6Wm2hynS5H9Gj7j%2Favatar.png?generation=1523462254548780&amp;alt=media"
        />
      </head>
      <body>
        <I18nProvider
          language={locale}
          supportedLngs={i18nConfig.supportedLngs}
          resources={resources}
        >
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return i18nConfig.supportedLngs.map((locale) => ({ locale }))
}
