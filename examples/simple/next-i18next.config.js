const { i18n } = require('./next.config')
const path = require('path')

module.exports = {
  ...i18n,
  localePath: path.resolve('./public/static/locales')
}
