// @ts-check

/**
 * @type {import('next-i18next').UserConfig}
 */
module.exports = {
  // https://www.i18next.com/overview/configuration-options#logging
  debug: process.env.NODE_ENV === 'development',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  /**
   * @link https://github.com/i18next/next-i18next#6-advanced-configuration
   *
  localePath: typeof window === 'undefined' ?
      require('path').resolve('./my-custom/path'):
      '/public/my-custom/path',
  */
  // saveMissing: false,
  // strictMode: true,
  // serializeConfig: false,
  // react: { useSuspense: false }
}
