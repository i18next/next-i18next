import type { I18nConfig, NormalizedConfig } from './types'

export function defineConfig(config: I18nConfig): I18nConfig {
  return config
}

export function normalizeConfig(userConfig: I18nConfig): NormalizedConfig {
  // Support legacy format: { i18n: { defaultLocale, locales } }
  const supportedLngs = userConfig.supportedLngs ??
    userConfig.i18n?.locales?.filter((l: string) => l !== 'default') ??
    ['en']
  const fallbackLng = userConfig.fallbackLng ??
    userConfig.i18n?.defaultLocale ??
    supportedLngs[0]

  if (!fallbackLng) {
    throw new Error('next-i18next: fallbackLng (or i18n.defaultLocale) is required')
  }
  if (supportedLngs.length === 0) {
    throw new Error('next-i18next: supportedLngs (or i18n.locales) must contain at least one language')
  }

  const defaultNS = userConfig.defaultNS ?? 'common'

  return {
    supportedLngs,
    fallbackLng,
    defaultNS,
    ns: userConfig.ns ?? [defaultNS],
    localeInPath: userConfig.localeInPath ?? true,
    localePath: userConfig.localePath ?? '/locales',
    localeStructure: userConfig.localeStructure ?? '{{lng}}/{{ns}}',
    localeExtension: userConfig.localeExtension ?? 'json',
    cookieName: userConfig.cookieName ?? 'i18next',
    headerName: userConfig.headerName ?? 'x-i18next-current-language',
    cookieMaxAge: userConfig.cookieMaxAge ?? 365 * 24 * 60 * 60,
    ignoredPaths: userConfig.ignoredPaths ?? ['/api', '/_next', '/static'],
    basePath: userConfig.basePath,
    resources: userConfig.resources,
    resourceLoader: userConfig.resourceLoader,
    use: userConfig.use ?? [],
    i18nextOptions: (userConfig.i18nextOptions ?? {}) as Record<string, any>,
    nonExplicitSupportedLngs: userConfig.nonExplicitSupportedLngs ?? false,
    // Preserve legacy fields
    i18n: userConfig.i18n,
    serializeConfig: userConfig.serializeConfig,
    reloadOnPrerender: userConfig.reloadOnPrerender,
  }
}
