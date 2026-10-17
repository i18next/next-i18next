// i18next-cli config: `npx i18next-cli types` writes @types/resources.d.ts with the
// messages as literal types, which parseInterpolation: 'icu' needs to check arguments
const config = {
  locales: ['en', 'de'],
  extract: {
    input: ['app/**/*.{ts,tsx}'],
    output: 'app/i18n/locales/{{language}}/{{namespace}}.json',
    defaultNS: 'common',
    messageFormat: 'icu' as const,
  },
  types: {
    input: ['app/i18n/locales/en/*.json'],
    output: '@types/i18next.d.ts',
    resourcesFile: '@types/resources.d.ts',
  },
}

export default config
