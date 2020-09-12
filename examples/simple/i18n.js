const NextI18Next = require('next-i18next').default
const Path = require('path')

module.exports = new NextI18Next({
  otherLanguages: ['de'],
  localeSubpaths, {
    de: 'de'
  },
  localePath: Path.resolve('./public/static/locales')
})
