import type { I18nConfig } from 'next-i18next'

// In dev, read from disk so `reloadOnPrerender` can pick up edits without a
// dev-server restart — bundlers cache dynamic `import()` JSON modules across
// HMR cycles, which would otherwise stall hot-reload after the first edit.
// In production, use bundler-traceable `import()` so locale files end up in
// the serverless function bundle (Vercel/Lambda/etc.).
const resourceLoader: I18nConfig['resourceLoader'] =
  process.env.NODE_ENV === 'development'
    ? async (language, namespace) => {
        const fs = await import('fs/promises')
        const path = await import('path')
        const content = await fs.readFile(
          path.resolve(process.cwd(), `app/i18n/locales/${language}/${namespace}.json`),
          'utf-8'
        )
        return JSON.parse(content)
      }
    : (language, namespace) => import(`./app/i18n/locales/${language}/${namespace}.json`)

const i18nConfig: I18nConfig = {
  supportedLngs: ['en', 'de', 'it'],
  fallbackLng: 'en',
  defaultNS: 'translation',
  ns: ['translation', 'footer', 'client-page', 'second-page', 'second-client-page'],
  resourceLoader,
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}

export default i18nConfig
