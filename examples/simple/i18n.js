/*
  Do not copy/paste this file. It is used internally
  to manage end-to-end test suites.
*/

const NextI18Next = require('next-i18next').default

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
  defaultLanguage: 'en',
  otherLanguages: ['de'],
  localeSubpaths: localeSubpathVariations[process.env.LOCALE_SUBPATHS],
})