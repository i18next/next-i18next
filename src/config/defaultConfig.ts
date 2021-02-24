const DEFAULT_LOCALE = 'en'
const LOCALES = ['en']
const DEFAULT_NAMESPACE = 'common'
const LOCALE_PATH = './public/locales'
const LOCALE_STRUCTURE = '{{lng}}/{{ns}}'
const LOCALE_EXTENSION = 'json'

export const defaultConfig = {
  defaultNS: DEFAULT_NAMESPACE,
  errorStackTraceLimit: 0,
  i18n: {
    defaultLocale: DEFAULT_LOCALE,
    locales: LOCALES,
  },
  get initImmediate(): boolean {
    return process.browser && typeof window !== 'undefined'
  },
  interpolation: {
    escapeValue: false,
    format: (value: string, format: string): string => (format === 'uppercase' ? value.toUpperCase() : value),
    formatSeparator: ',',
  },
  load: 'currentOnly',
  localeExtension: LOCALE_EXTENSION,
  localePath: LOCALE_PATH,
  localeStructure: LOCALE_STRUCTURE,
  react: {
    useSuspense: true,
  },
  serializeConfig: true,
  strictMode: true,
  use: [],
}
