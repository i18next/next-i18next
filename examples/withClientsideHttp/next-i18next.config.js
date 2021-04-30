const i18nextHttpBackend = require('i18next-http-backend/cjs')
const chainedBackend= require('i18next-chained-backend').default
const localStorageBackend = require('i18next-localstorage-backend').default

module.exports = {
  backend: {
    backendOptions: [{}, {expirationTime: 60 * 60 * 1000}], // 1 hour
    backends: process.browser ? [localStorageBackend, i18nextHttpBackend]: [],
  },
  debug: true,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
  },
  ns: ['common', 'second-page', 'footer'], // the namespaces needs to be listed here, to make sure they got preloaded
  partialBundledLanguages: true,
  react: {
    useSuspense: false,
  },
  serializeConfig: false,
  use: process.browser ?
    [chainedBackend] :
    [],
}
