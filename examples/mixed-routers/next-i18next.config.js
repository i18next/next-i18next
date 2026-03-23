// @ts-check
const shared = require('./i18n.shared.js')

/**
 * @type {import('next-i18next/pages').UserConfig}
 */
module.exports = {
  i18n: {
    defaultLocale: shared.fallbackLng,
    locales: shared.supportedLngs,
  },
  localePath:
    typeof window === 'undefined'
      ? require('path').resolve('./public/locales')
      : '/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}
