/*
  Do not copy/paste this file. It is used internally
  to manage end-to-end test suites.
*/

const NextI18Next = require('next-i18next').default
const { localeSubpaths } = require('next/config').default().publicRuntimeConfig

const localeSubpathVariations = {
  none: {},
  foreign: {
    de: 'de',
  },
  all: {
    en: 'en',
    de: 'de',
  },
}

module.exports = new NextI18Next({
  otherLanguages: ['de'],
  localeSubpaths: localeSubpathVariations[localeSubpaths],
})
