const { withHmrNextConfig } = require('next-i18next/withHmrNextConfig')
const { i18n } = require('./next-i18next.config')

module.exports = withHmrNextConfig(i18n)()
