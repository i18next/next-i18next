const DEFAULT_LANGUAGE = 'en'
const OTHER_LANGUAGES = []
const DEFAULT_NAMESPACE = 'common'
const LOCALE_PATH = 'static/locales'
const LOCALE_STRUCTURE = '{{lng}}/{{ns}}'
const LOCALE_SUBPATHS = false

const NEXT_I18NEXT_TRACE_LIMIT = parseInt(`${process.env.NEXT_i18NEXT_TRACE_LIMIT}`, 10) || 0

export default {
  defaultLanguage: DEFAULT_LANGUAGE,
  otherLanguages: OTHER_LANGUAGES,
  fallbackLng: process.env.NODE_ENV === 'production' ? DEFAULT_LANGUAGE : null,
  load: 'languageOnly',
  localePath: LOCALE_PATH,
  localeStructure: LOCALE_STRUCTURE,
  localeSubpaths: LOCALE_SUBPATHS,
  ns: [DEFAULT_NAMESPACE],
  use: [],
  defaultNS: DEFAULT_NAMESPACE,
  interpolation: {
    escapeValue: false,
    formatSeparator: ',',
    format: (value, format) => (format === 'uppercase' ? value.toUpperCase() : value),
  },
  browserLanguageDetection: true,
  ignoreRoutes: ['/_next', '/static'],
  detection: {
    order: ['cookie', 'header', 'querystring'],
    caches: ['cookie'],
  },
  backend: {
    loadPath: `/${LOCALE_PATH}/${LOCALE_STRUCTURE}.json`,
    addPath: `/${LOCALE_PATH}/${LOCALE_STRUCTURE}.missing.json`,
  },
  react: {
    wait: true,
  },
  strictMode: true,
  traceLimit: NEXT_I18NEXT_TRACE_LIMIT,
}
