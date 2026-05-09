// In dev, read from disk so `reloadOnPrerender` can pick up edits without a
// dev-server restart — bundlers cache dynamic `import()` JSON modules across
// HMR cycles, which would otherwise stall hot-reload after the first edit.
// In production, use bundler-traceable `import()` so locale files end up in
// the serverless function bundle (Vercel/Lambda/etc.).
const resourceLoader =
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

/** @type {import('next-i18next/proxy').I18nConfig} */
const i18nConfig = {
  supportedLngs: ['en', 'de', 'it'],
  fallbackLng: 'en',
  defaultNS: 'translation',
  localeInPath: false,
  ns: ['translation', 'footer', 'client-page', 'second-page', 'second-client-page'],
  resourceLoader,
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}

module.exports = i18nConfig
