// @ts-check

const HttpBackend = require('i18next-http-backend/cjs')
const ChainedBackend = require('i18next-chained-backend').default
const LocalStorageBackend =
  require('i18next-localstorage-backend').default

const isBrowser = typeof window !== 'undefined'
const isDev = process.env.NODE_ENV === 'development'

/**
 * @type {import('next-i18next').UserConfig}
 */
module.exports = {
  // It should config backend, use, partialBundledLanguages in case you want translate for auto static page
  backend: {
    backendOptions: [
      { expirationTime: isDev ? 60 * 1000 : 60 * 60 * 1000 },
      {},
    ], // 1 hour
    backends: isBrowser ? [LocalStorageBackend, HttpBackend] : [],
  },
  // https://www.i18next.com/overview/configuration-options#logging
  debug: isDev,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
  },
  initImmediate: false,
  /** To avoid issues when deploying to some paas (vercel...) */
  localePath:
    typeof window === 'undefined'
      ? require('path').resolve('./public/locales')
      : '/locales',
  ns: ['common', 'footer', 'second-page', 'staticpage'],
  partialBundledLanguages: isBrowser,
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  use: isBrowser ? [ChainedBackend] : [],
  /**
   * @link https://github.com/i18next/next-i18next#6-advanced-configuration
   */
  // saveMissing: false,
  // strictMode: true,
  // serializeConfig: false,
  // react: { useSuspense: false }
}
