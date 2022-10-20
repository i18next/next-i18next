/**
 * Types augmentation for translation keys to allow to typecheck
 * and suggesting keys to the t function. In case it's too slow
 * you can opt out by commenting the following code.
 * @link https://react.i18next.com/latest/typescript
 */
import 'react-i18next'

import type common from '../public/locales/en/common.json'
import type footer from '../public/locales/en/footer.json'
import type secondPage from '../public/locales/en/second-page.json'

interface I18nNamespaces {
    common: typeof common
    footer: typeof footer
    'second-page': typeof secondPage
}

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: I18nNamespaces
  }
}
