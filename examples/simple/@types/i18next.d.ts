/**
 * If you want to enable locale keys typechecking and enhance IDE experience.
 *
 * Requires `resolveJsonModule:true` in your tsconfig.json.
 *
 * @link https://www.i18next.com/overview/typescript
 */
import 'i18next'

import type common from '../public/locales/en/common.json'
import type footer from '../public/locales/en/footer.json'
import type secondPage from '../public/locales/en/second-page.json'

interface I18nNamespaces {
  common: typeof common
  footer: typeof footer
  'second-page': typeof secondPage
}

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: I18nNamespaces
  }
}
