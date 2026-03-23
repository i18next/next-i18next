import { defineConfig, normalizeConfig } from './config'
import type { I18nConfig, NormalizedConfig } from './types'

describe('defineConfig', () => {
  it('returns the same config object', () => {
    const config: I18nConfig = {
      supportedLngs: ['en', 'de'],
      fallbackLng: 'en',
    }
    expect(defineConfig(config)).toBe(config)
  })
})

describe('normalizeConfig', () => {
  it('fills in all defaults', () => {
    const result: NormalizedConfig = normalizeConfig({
      supportedLngs: ['en', 'de'],
      fallbackLng: 'en',
    })

    expect(result.supportedLngs).toEqual(['en', 'de'])
    expect(result.fallbackLng).toBe('en')
    expect(result.defaultNS).toBe('common')
    expect(result.ns).toEqual(['common'])
    expect(result.localeInPath).toBe(true)
    expect(result.localePath).toBe('/locales')
    expect(result.localeStructure).toBe('{{lng}}/{{ns}}')
    expect(result.localeExtension).toBe('json')
    expect(result.cookieName).toBe('i18next')
    expect(result.headerName).toBe('x-i18next-current-language')
    expect(result.cookieMaxAge).toBe(365 * 24 * 60 * 60)
    expect(result.ignoredPaths).toEqual(['/api', '/_next', '/static'])
    expect(result.use).toEqual([])
    expect(result.i18nextOptions).toEqual({})
    expect(result.nonExplicitSupportedLngs).toBe(false)
  })

  it('preserves user-provided values', () => {
    const result = normalizeConfig({
      supportedLngs: ['en', 'de', 'fr'],
      fallbackLng: 'de',
      defaultNS: 'translation',
      ns: ['translation', 'common'],
      localeInPath: false,
      localePath: '/i18n',
      localeStructure: '{{ns}}/{{lng}}',
      localeExtension: 'yml',
      cookieName: 'lang',
      headerName: 'x-lang',
      cookieMaxAge: 3600,
      ignoredPaths: ['/api'],
      nonExplicitSupportedLngs: true,
      i18nextOptions: { debug: true },
    })

    expect(result.supportedLngs).toEqual(['en', 'de', 'fr'])
    expect(result.fallbackLng).toBe('de')
    expect(result.defaultNS).toBe('translation')
    expect(result.ns).toEqual(['translation', 'common'])
    expect(result.localeInPath).toBe(false)
    expect(result.localePath).toBe('/i18n')
    expect(result.localeStructure).toBe('{{ns}}/{{lng}}')
    expect(result.localeExtension).toBe('yml')
    expect(result.cookieName).toBe('lang')
    expect(result.headerName).toBe('x-lang')
    expect(result.cookieMaxAge).toBe(3600)
    expect(result.ignoredPaths).toEqual(['/api'])
    expect(result.nonExplicitSupportedLngs).toBe(true)
    expect(result.i18nextOptions).toEqual({ debug: true })
  })

  it('supports legacy i18n format', () => {
    const result = normalizeConfig({
      i18n: {
        defaultLocale: 'fr',
        locales: ['en', 'fr', 'de'],
      },
    } as I18nConfig)

    expect(result.supportedLngs).toEqual(['en', 'fr', 'de'])
    expect(result.fallbackLng).toBe('fr')
  })

  it('filters out "default" from legacy locales', () => {
    const result = normalizeConfig({
      i18n: {
        defaultLocale: 'en',
        locales: ['default', 'en', 'de'],
      },
    } as I18nConfig)

    expect(result.supportedLngs).toEqual(['en', 'de'])
  })

  it('throws if no fallbackLng can be determined', () => {
    expect(() =>
      normalizeConfig({ supportedLngs: [] } as any)
    ).toThrow('fallbackLng (or i18n.defaultLocale) is required')
  })

  it('preserves resourceLoader', () => {
    const loader = async () => ({})
    const result = normalizeConfig({
      supportedLngs: ['en'],
      fallbackLng: 'en',
      resourceLoader: loader,
    })
    expect(result.resourceLoader).toBe(loader)
  })

  it('preserves use plugins', () => {
    const plugin = { type: 'backend' as const }
    const result = normalizeConfig({
      supportedLngs: ['en'],
      fallbackLng: 'en',
      use: [plugin],
    })
    expect(result.use).toEqual([plugin])
  })

  it('preserves basePath', () => {
    const result = normalizeConfig({
      supportedLngs: ['en', 'de'],
      fallbackLng: 'en',
      basePath: '/app-router',
    })
    expect(result.basePath).toBe('/app-router')
  })

  it('leaves basePath undefined when not set', () => {
    const result = normalizeConfig({
      supportedLngs: ['en'],
      fallbackLng: 'en',
    })
    expect(result.basePath).toBeUndefined()
  })
})
