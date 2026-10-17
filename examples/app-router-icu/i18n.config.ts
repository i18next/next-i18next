import type { I18nConfig } from 'next-i18next/proxy'
import ICU from 'i18next-icu'

const i18nConfig: I18nConfig = {
  supportedLngs: ['en', 'de'],
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common'],
  resourceLoader: (language, namespace) => import(`./app/i18n/locales/${language}/${namespace}.json`),
  // The server instance formats ICU messages; the client gets i18next-icu from next-i18next/icu
  use: [ICU],
}

export default i18nConfig
