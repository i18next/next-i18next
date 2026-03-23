import type { I18nConfig } from 'next-i18next'

const i18nConfig: I18nConfig = {
  supportedLngs: ['en', 'de', 'it'],
  fallbackLng: 'en',
  defaultNS: 'translation',
  ns: ['translation', 'footer', 'client-page', 'second-page', 'second-client-page'],
  resourceLoader: (language: string, namespace: string) => import(`./app/i18n/locales/${language}/${namespace}.json`),
}

export default i18nConfig
