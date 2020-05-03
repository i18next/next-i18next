/*
  Do not copy/paste this code. It is used internally
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


/*
  Uncomment the code below to run the example in your local environment
*/

/*
const NextI18Next = require('next-i18next').default

module.exports = new NextI18Next({
  defaultLanguage: 'en',
  otherLanguages: ['de'],
  localeSubpaths: {
    de: 'de',
    en: 'en'
  }
})
*/
