require('dotenv').config()

module.exports = {
  webpack: (config) => {
    return config
  },
  env: {
    LOCALE_SUBPATHS: typeof process.env.LOCALE_SUBPATHS === 'string' ? process.env.LOCALE_SUBPATHS : 'none'
  }
}