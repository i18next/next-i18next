import 'i18next'
import type common from '../app/i18n/locales/en/common.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: { common: typeof common }
    // ICU plurals like `{count, plural, one {# photo} other {# photos}}` are not
    // i18next `{{variables}}`: keep keys typed, skip parsing values for variables
    parseInterpolation: false
  }
}
