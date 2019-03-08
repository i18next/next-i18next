
const {localeSubpaths} = require('next/config').default().publicRuntimeConfig
const NextI18Next = require('next-i18next/dist/commonjs').default;

module.exports = new NextI18Next({
    defaultLanguage: 'en',
    otherLanguages: ['de'],
    localeSubpaths // locale subpaths for url could be none, foreign or all
});
