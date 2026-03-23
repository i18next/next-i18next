/** @type {import('next-i18next/proxy').I18nConfig} */
const i18nConfig = {
  supportedLngs: ['en', 'de', 'it'],
  fallbackLng: 'en',
  defaultNS: 'translation',
  localeInPath: false,
  ns: ['translation', 'footer', 'client-page', 'second-page', 'second-client-page'],
  resourceLoader: (language, namespace) => import(`./app/i18n/locales/${language}/${namespace}.json`),
}

module.exports = i18nConfig
