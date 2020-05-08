const NextI18Next = require('next-i18next').default
const { localeSubpaths } = require('next/config').default().publicRuntimeConfig

// this will download the translations from locize directly, in client (browser) and server (node.js)
// DO NOT USE THIS if having a serverless environment => this will generate too much download requests
//   => https://github.com/locize/i18next-locize-backend#important-advice-for-serverless-environments---aws-lambda-google-cloud-functions-azure-functions-etc
module.exports = new NextI18Next({
  otherLanguages: ['de'],
  localeSubpaths,
  backend: {
    projectId: 'd3b405cf-2532-46ae-adb8-99e88d876733',
    referenceLng: 'en'
  },
  use: [
    require('i18next-locize-backend/cjs')
  ]
})

// for a serverless environment bundle the translations first. See downloadLocales script in package.json
// and configre this file like this:
// module.exports = new NextI18Next({
//   otherLanguages: ['de'],
//   localeSubpaths
// })