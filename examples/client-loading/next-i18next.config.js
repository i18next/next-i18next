const HttpBackend = require('i18next-http-backend/cjs')
const ChainedBackend= require('i18next-chained-backend').default
const LocalStorageBackend = require('i18next-localstorage-backend').default

module.exports = {
  backend: {
    backendOptions: [{ expirationTime: 60 * 60 * 1000 }, {}], // 1 hour
    backends: process.browser ? [LocalStorageBackend, HttpBackend]: [],
  },
  // debug: true,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
  },
  serializeConfig: false,
  use: process.browser ? [ChainedBackend] : [],
}
