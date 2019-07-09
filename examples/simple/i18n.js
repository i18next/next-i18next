
const { localeSubpaths } = require('next/config').default().publicRuntimeConfig
const NextI18Next = require('next-i18next').default

module.exports = new NextI18Next({
  otherLanguages: ['de'],
  localeSubpaths,
})
