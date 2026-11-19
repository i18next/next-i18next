import { getInternalPath, getLocalizedPath } from './pathnames'

const config = {
  supportedLngs: ['en', 'de', 'it'],
  fallbackLng: 'en',
  pathnames: {
    '/contact': { de: '/kontakt', it: '/contatti' },
    '/blog/[slug]': { de: '/artikel/[slug]' },
  },
}

describe('getLocalizedPath', () => {
  it('returns the public path with the locale prefix', () => {
    expect(getLocalizedPath('/contact', 'de', config)).toBe('/de/kontakt')
    expect(getLocalizedPath('/blog/my-post', 'de', config)).toBe('/de/artikel/my-post')
    expect(getLocalizedPath('/contact', 'en', config)).toBe('/en/contact')
    expect(getLocalizedPath('/', 'it', config)).toBe('/it')
  })

  it('does not translate in modes where the proxy ignores pathnames', () => {
    expect(getLocalizedPath('/contact', 'de', { ...config, localeInPath: 'internal' })).toBe('/contact')
    expect(getInternalPath('/de/kontakt', { ...config, localeInPath: 'internal' })).toEqual({ lng: 'de', path: '/kontakt' })
  })

  it('returns the basePath for the root of the default language with hideDefaultLocale', () => {
    expect(getLocalizedPath('/', 'en', { ...config, hideDefaultLocale: true, basePath: 'app' })).toBe('/app')
  })

  it('leaves out the default locale with hideDefaultLocale and keeps basePath', () => {
    expect(getLocalizedPath('/contact', 'en', { ...config, hideDefaultLocale: true })).toBe('/contact')
    expect(getLocalizedPath('/contact', 'de', { ...config, basePath: 'app' })).toBe('/app/de/kontakt')
  })
})

describe('getInternalPath', () => {
  it('returns the language and the internal route of a public path', () => {
    expect(getInternalPath('/de/kontakt', config)).toEqual({ lng: 'de', path: '/contact' })
    expect(getInternalPath('/de/artikel/my-post', config)).toEqual({ lng: 'de', path: '/blog/my-post' })
    expect(getInternalPath('/it', config)).toEqual({ lng: 'it', path: '/' })
    expect(getInternalPath('/contact', config)).toEqual({ path: '/contact' })
    expect(getInternalPath('/contact', { ...config, hideDefaultLocale: true })).toEqual({ lng: 'en', path: '/contact' })
    expect(getInternalPath('/app/it/contatti', { ...config, basePath: '/app' })).toEqual({ lng: 'it', path: '/contact' })
  })

  it('switches the language of the current page', () => {
    const { path } = getInternalPath('/de/kontakt', config)
    expect(getLocalizedPath(path, 'it', config)).toBe('/it/contatti')
  })
})
