const { nextI18NextRewrites } = require('next-i18next/rewrites')

const localeSubpaths = {
  de: 'de',
}

module.exports = {
  publicRuntimeConfig: {
    localeSubpaths,
  },
  experimental: {
    async rewrites() {
      return [
        ...nextI18NextRewrites(localeSubpaths)
      ]
    }
  }
}
