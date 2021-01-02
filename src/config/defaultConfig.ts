import { isServer } from '../utils'

const DEFAULT_LOCALE = 'en'
const LOCALES = ['en']
const DEFAULT_NAMESPACE = 'common'
const LOCALE_PATH = '/public/static/locales'
const LOCALE_STRUCTURE = '{{lng}}/{{ns}}'
const LOCALE_EXTENSION = 'json'

export const defaultConfig = {
  defaultLocale: DEFAULT_LOCALE,
  locales: LOCALES,

  load: 'currentOnly',
  localePath: LOCALE_PATH,
  localeStructure: LOCALE_STRUCTURE,
  localeExtension: LOCALE_EXTENSION,
  use: [],
  defaultNS: DEFAULT_NAMESPACE,
  interpolation: {
    escapeValue: false,
    formatSeparator: ',',
    format: (value: string, format: string): string => (format === 'uppercase' ? value.toUpperCase() : value),
  },
  browserLanguageDetection: true,
  serverLanguageDetection: true,
  ignoreRoutes: ['/_next/', '/static/', '/public/', '/api/'],
  customDetectors: [],
  react: {
    wait: true,
    useSuspense: false,
  },
  strictMode: true,
  errorStackTraceLimit: 0,
  shallowRender: false,
  get initImmediate(): boolean {
    return !isServer()
  }
}
