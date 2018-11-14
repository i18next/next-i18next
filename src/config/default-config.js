const DEFAULT_LANGUAGE = 'en'
const OTHER_LANGUAGES = ['de']
const DEFAULT_NAMESPACE = 'common'
const LOCALE_PATH = 'static/locales'
const LOCALE_STRUCTURE = '{{lng}}/{{ns}}'
const LOCALE_SUBPATHS = true

export default {
  allLanguages: OTHER_LANGUAGES.concat([DEFAULT_LANGUAGE]),
  defaultLanguage: DEFAULT_LANGUAGE,
  fallbackLng: process.env.NODE_ENV === 'production' ? DEFAULT_LANGUAGE : null,
  load: 'languageOnly',
  localePath: LOCALE_PATH,
  localeStructure: LOCALE_STRUCTURE,
  localeSubpaths: LOCALE_SUBPATHS,
  ns: [DEFAULT_NAMESPACE],
  defaultNS: DEFAULT_NAMESPACE,
  interpolation: {
    escapeValue: false,
    formatSeparator: ',',
    format: (value, format) => (format === 'uppercase' ? value.toUpperCase() : value),
  },
  detection: {
    order: ['cookie', 'header', 'querystring'],
    caches: ['cookie'],
  },
  backend: {
    loadPath: `/${LOCALE_PATH}/${LOCALE_STRUCTURE}.json`,
    addPath: `/${LOCALE_PATH}/${LOCALE_STRUCTURE}.missing.json`,
  },
}
