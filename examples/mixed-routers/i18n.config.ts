import type { I18nConfig } from 'next-i18next/proxy'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const shared = require('./i18n.shared.js')

const i18nConfig: I18nConfig = {
  ...shared,
  basePath: '/app-router',
  resourceLoader: (language: string, namespace: string) =>
    import(`./public/locales/${language}/${namespace}.json`),
}

export default i18nConfig
