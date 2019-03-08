const withTypescript = require('@zeit/next-typescript')

module.exports = withTypescript({
  publicRuntimeConfig: {
    localeSubpaths: typeof process.env.LOCALE_SUBPATHS === 'string'
      ? process.env.LOCALE_SUBPATHS
      : 'none',
  },
})
