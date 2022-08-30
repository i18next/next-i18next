// used for SSR (getServerSideProps)
// const path = require('path')
// const localePath = path.resolve('./public/locales')

module.exports = {
  // https://www.i18next.com/overview/configuration-options#logging
  debug: true,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
  },
  // localePath,
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}
