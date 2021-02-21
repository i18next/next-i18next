const DEFAULT_LOCALE = 'en'
const LOCALES = ['en']
const DEFAULT_NAMESPACE = 'common'
const LOCALE_PATH = './public/locales'
const LOCALE_STRUCTURE = '{{lng}}/{{ns}}'
const LOCALE_EXTENSION = 'json'

export const defaultConfig = {
  i18n: {
    defaultLocale: DEFAULT_LOCALE,
    locales: LOCALES,
  },

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
  react: {
    wait: true,
    useSuspense: false,
  },
  strictMode: true,
  errorStackTraceLimit: 0,
  get initImmediate(): boolean {
    return process.browser
  }
}
