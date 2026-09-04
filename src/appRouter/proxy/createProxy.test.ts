/**
 * @jest-environment node
 */

// Mock next/server before importing the module under test
const mockRedirect = jest.fn()
const mockRewrite = jest.fn()
const mockNext = jest.fn()

jest.mock('next/server', () => {
  class MockNextResponse {
    headers: Map<string, string>
    cookies: {
      set: jest.Mock
    }

    status: number

    constructor() {
      this.headers = new Map()
      this.cookies = { set: jest.fn() }
      this.status = 200
    }

    static redirect(url: URL | string) {
      const resp = new MockNextResponse()
      mockRedirect(url)
      return resp
    }

    static rewrite(url: URL | string, opts?: { request?: { headers?: Headers } }) {
      const resp = new MockNextResponse()
      mockRewrite(url, opts)
      return resp
    }

    static next(opts?: { request?: { headers?: Headers } }) {
      const resp = new MockNextResponse()
      mockNext(opts)
      return resp
    }
  }

  // Real NextURL so Next's basePath handling (stripped from pathname, re-added by toString) is exercised
  const { NextURL } = jest.requireActual('next/dist/server/web/next-url')

  class MockNextRequest {
    nextUrl: any
    url: string
    cookies: {
      get: jest.Mock
    }

    headers: Headers

    constructor(url: string, opts: { headers?: Record<string, string>; cookies?: Record<string, string>; basePath?: string } = {}) {
      this.nextUrl = new NextURL(url, { nextConfig: opts.basePath ? { basePath: opts.basePath } : undefined })
      this.url = url
      this.headers = new Headers(opts.headers)
      this.cookies = {
        get: jest.fn((name: string) => {
          if (opts.cookies?.[name]) {
            return { value: opts.cookies[name] }
          }
          return undefined
        }),
      }
    }
  }

  return {
    NextRequest: MockNextRequest,
    NextResponse: MockNextResponse,
  }
})

import { createProxy } from './index'
const { NextRequest } = require('next/server')

describe('createProxy', () => {
  beforeEach(() => {
    mockRedirect.mockClear()
    mockRewrite.mockClear()
    mockNext.mockClear()
  })

  const config = {
    supportedLngs: ['en', 'de', 'fr'],
    fallbackLng: 'en',
  }

  it('redirects to locale-in-path when locale is not in URL', () => {
    const middleware = createProxy(config)
    const req = new NextRequest('http://localhost/about')
    middleware(req)

    expect(mockRedirect).toHaveBeenCalledTimes(1)
    const redirectUrl = mockRedirect.mock.calls[0][0] as URL
    expect(redirectUrl.pathname).toBe('/en/about')
  })

  it('does not redirect when locale is already in URL', () => {
    const middleware = createProxy(config)
    const req = new NextRequest('http://localhost/de/about')
    middleware(req)

    expect(mockRedirect).not.toHaveBeenCalled()
    expect(mockNext).toHaveBeenCalledTimes(1)
  })

  it('reads language from cookie', () => {
    const middleware = createProxy(config)
    const req = new NextRequest('http://localhost/about', {
      cookies: { i18next: 'de' },
    })
    middleware(req)

    expect(mockRedirect).toHaveBeenCalledTimes(1)
    const redirectUrl = mockRedirect.mock.calls[0][0] as URL
    expect(redirectUrl.pathname).toBe('/de/about')
  })

  it('reads language from Accept-Language header', () => {
    const middleware = createProxy(config)
    const req = new NextRequest('http://localhost/about', {
      headers: { 'Accept-Language': 'fr;q=1.0,en;q=0.5' },
    })
    middleware(req)

    expect(mockRedirect).toHaveBeenCalledTimes(1)
    const redirectUrl = mockRedirect.mock.calls[0][0] as URL
    expect(redirectUrl.pathname).toBe('/fr/about')
  })

  it('skips ignored paths', () => {
    const middleware = createProxy(config)
    const req = new NextRequest('http://localhost/api/data')

    middleware(req)

    expect(mockRedirect).not.toHaveBeenCalled()
    expect(mockNext).toHaveBeenCalledTimes(1)
  })

  it('skips static file extensions', () => {
    const middleware = createProxy(config)
    const req = new NextRequest('http://localhost/favicon.ico')

    middleware(req)

    expect(mockRedirect).not.toHaveBeenCalled()
    expect(mockNext).toHaveBeenCalledTimes(1)
  })

  it('sets custom header with detected language', () => {
    const middleware = createProxy(config)
    const req = new NextRequest('http://localhost/en/about')

    middleware(req)

    expect(mockNext).toHaveBeenCalledTimes(1)
    const opts = mockNext.mock.calls[0][0]
    const headers = opts?.request?.headers as Headers
    expect(headers.get('x-i18next-current-language')).toBe('en')
  })

  it('works in no-locale-path mode', () => {
    const middleware = createProxy({
      ...config,
      localeInPath: false,
    })
    const req = new NextRequest('http://localhost/about')

    middleware(req)

    // Should not redirect
    expect(mockRedirect).not.toHaveBeenCalled()
    expect(mockNext).toHaveBeenCalledTimes(1)

    // Should set header with detected language
    const opts = mockNext.mock.calls[0][0]
    const headers = opts?.request?.headers as Headers
    expect(headers.get('x-i18next-current-language')).toBe('en')
  })

  it('preserves query string in redirect URL', () => {
    const middleware = createProxy(config)
    const req = new NextRequest('http://localhost/about?ref=home&tab=1')
    middleware(req)

    expect(mockRedirect).toHaveBeenCalledTimes(1)
    const redirectUrl = mockRedirect.mock.calls[0][0] as URL
    expect(redirectUrl.pathname).toBe('/en/about')
    expect(redirectUrl.search).toBe('?ref=home&tab=1')
  })

  it('persists language from referer URL into cookie', () => {
    const middleware = createProxy(config)
    const req = new NextRequest('http://localhost/de/about', {
      headers: { referer: 'http://localhost/fr/home' },
    })

    const response = middleware(req)

    expect(mockRedirect).not.toHaveBeenCalled()
    expect(mockNext).toHaveBeenCalledTimes(1)
    // The response should have a cookie set for the referer language
    expect(response.cookies.set).toHaveBeenCalledWith(
      'i18next',
      'fr',
      expect.objectContaining({ path: '/', sameSite: 'lax' }),
    )
  })

  it('does not set referer cookie when referer has no locale prefix', () => {
    const middleware = createProxy(config)
    const req = new NextRequest('http://localhost/en/about', {
      headers: { referer: 'http://localhost/about' },
    })

    const response = middleware(req)

    expect(mockNext).toHaveBeenCalledTimes(1)
    expect(response.cookies.set).not.toHaveBeenCalled()
  })

  it('falls back to default language when cookie has unsupported value', () => {
    const middleware = createProxy(config)
    const req = new NextRequest('http://localhost/about', {
      cookies: { i18next: 'xx' }, // unsupported
    })
    middleware(req)

    expect(mockRedirect).toHaveBeenCalledTimes(1)
    const redirectUrl = mockRedirect.mock.calls[0][0] as URL
    expect(redirectUrl.pathname).toBe('/en/about')
  })

  describe('nonExplicitSupportedLngs', () => {
    const regionalConfig = {
      supportedLngs: ['en-US', 'en-GB', 'de-DE'],
      fallbackLng: 'en-US',
      nonExplicitSupportedLngs: true,
    }

    it('matches base language from Accept-Language to regional supported code', () => {
      const middleware = createProxy(regionalConfig)
      const req = new NextRequest('http://localhost/about', {
        headers: { 'Accept-Language': 'de;q=1.0' },
      })
      middleware(req)

      expect(mockRedirect).toHaveBeenCalledTimes(1)
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL
      expect(redirectUrl.pathname).toBe('/de-DE/about')
    })

    it('matches base language from cookie to regional supported code', () => {
      const middleware = createProxy(regionalConfig)
      const req = new NextRequest('http://localhost/about', {
        cookies: { i18next: 'de' },
      })
      middleware(req)

      expect(mockRedirect).toHaveBeenCalledTimes(1)
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL
      expect(redirectUrl.pathname).toBe('/de-DE/about')
    })

    it('recognizes regional code in URL path', () => {
      const middleware = createProxy(regionalConfig)
      const req = new NextRequest('http://localhost/en-US/about')
      middleware(req)

      expect(mockRedirect).not.toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('does not reverse match when flag is off', () => {
      const middleware = createProxy({
        ...regionalConfig,
        nonExplicitSupportedLngs: false,
      })
      const req = new NextRequest('http://localhost/about', {
        headers: { 'Accept-Language': 'de;q=1.0' },
      })
      middleware(req)

      expect(mockRedirect).toHaveBeenCalledTimes(1)
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL
      // Falls back to default since 'de' doesn't match any of 'en-US', 'en-GB', 'de-DE' without the flag
      expect(redirectUrl.pathname).toBe('/en-US/about')
    })
  })

  describe('hideDefaultLocale', () => {
    const hideConfig = {
      supportedLngs: ['en', 'de', 'fr'],
      fallbackLng: 'en',
      hideDefaultLocale: true,
    }

    it('rewrites root path to default locale internally', () => {
      const middleware = createProxy(hideConfig)
      const req = new NextRequest('http://localhost/')
      middleware(req)

      expect(mockRedirect).not.toHaveBeenCalled()
      expect(mockRewrite).toHaveBeenCalledTimes(1)
      const rewriteUrl = mockRewrite.mock.calls[0][0] as URL
      expect(rewriteUrl.pathname).toBe('/en/')
    })

    it('rewrites non-locale path to default locale internally', () => {
      const middleware = createProxy(hideConfig)
      const req = new NextRequest('http://localhost/about')
      middleware(req)

      expect(mockRedirect).not.toHaveBeenCalled()
      expect(mockRewrite).toHaveBeenCalledTimes(1)
      const rewriteUrl = mockRewrite.mock.calls[0][0] as URL
      expect(rewriteUrl.pathname).toBe('/en/about')
    })

    it('preserves query string in rewrite', () => {
      const middleware = createProxy(hideConfig)
      const req = new NextRequest('http://localhost/about?tab=1')
      middleware(req)

      expect(mockRewrite).toHaveBeenCalledTimes(1)
      const rewriteUrl = mockRewrite.mock.calls[0][0] as URL
      expect(rewriteUrl.pathname).toBe('/en/about')
      expect(rewriteUrl.search).toBe('?tab=1')
    })

    it('sets header with default language on rewrite', () => {
      const middleware = createProxy(hideConfig)
      const req = new NextRequest('http://localhost/about')
      middleware(req)

      expect(mockRewrite).toHaveBeenCalledTimes(1)
      const opts = mockRewrite.mock.calls[0][1]
      const headers = opts?.request?.headers as Headers
      expect(headers.get('x-i18next-current-language')).toBe('en')
    })

    it('redirects explicit default locale path to clean URL', () => {
      const middleware = createProxy(hideConfig)
      const req = new NextRequest('http://localhost/en/about')
      middleware(req)

      expect(mockRedirect).toHaveBeenCalledTimes(1)
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL
      expect(redirectUrl.pathname).toBe('/about')
    })

    it('redirects explicit default locale root to /', () => {
      const middleware = createProxy(hideConfig)
      const req = new NextRequest('http://localhost/en')
      middleware(req)

      expect(mockRedirect).toHaveBeenCalledTimes(1)
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL
      expect(redirectUrl.pathname).toBe('/')
    })

    it('preserves query string when redirecting default locale', () => {
      const middleware = createProxy(hideConfig)
      const req = new NextRequest('http://localhost/en/about?tab=1')
      middleware(req)

      expect(mockRedirect).toHaveBeenCalledTimes(1)
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL
      expect(redirectUrl.pathname).toBe('/about')
      expect(redirectUrl.search).toBe('?tab=1')
    })

    it('passes through non-default locale normally', () => {
      const middleware = createProxy(hideConfig)
      const req = new NextRequest('http://localhost/de/about')
      middleware(req)

      expect(mockRedirect).not.toHaveBeenCalled()
      expect(mockRewrite).not.toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('sets header for non-default locale', () => {
      const middleware = createProxy(hideConfig)
      const req = new NextRequest('http://localhost/de/about')
      middleware(req)

      const opts = mockNext.mock.calls[0][0]
      const headers = opts?.request?.headers as Headers
      expect(headers.get('x-i18next-current-language')).toBe('de')
    })

    it('ignores cookie language and always rewrites to default locale', () => {
      const middleware = createProxy(hideConfig)
      const req = new NextRequest('http://localhost/about', {
        cookies: { i18next: 'de' },
      })
      middleware(req)

      // Should rewrite (not redirect), because hideDefaultLocale treats no-prefix as default
      expect(mockRewrite).toHaveBeenCalledTimes(1)
      const rewriteUrl = mockRewrite.mock.calls[0][0] as URL
      expect(rewriteUrl.pathname).toBe('/en/about')
      expect(mockRedirect).not.toHaveBeenCalled()
    })
  })

  describe("localeInPath: 'internal'", () => {
    const internalConfig = {
      supportedLngs: ['en', 'de', 'fr'],
      fallbackLng: 'en',
      localeInPath: 'internal' as const,
    }

    it('rewrites a clean URL to the cookie language and sets the header (cookie unchanged, so not rewritten)', () => {
      const middleware = createProxy(internalConfig)
      const req = new NextRequest('http://localhost/about?tab=1', {
        cookies: { i18next: 'de' },
      })
      const response = middleware(req)

      expect(mockRedirect).not.toHaveBeenCalled()
      expect(mockNext).not.toHaveBeenCalled()
      expect(mockRewrite).toHaveBeenCalledTimes(1)
      const rewriteUrl = mockRewrite.mock.calls[0][0] as URL
      expect(rewriteUrl.pathname).toBe('/de/about')
      expect(rewriteUrl.search).toBe('?tab=1')
      const headers = mockRewrite.mock.calls[0][1]?.request?.headers as Headers
      expect(headers.get('x-i18next-current-language')).toBe('de')
      expect(response.cookies.set).not.toHaveBeenCalled()
    })

    it('rewrites to the Accept-Language match when there is no cookie', () => {
      const middleware = createProxy(internalConfig)
      const req = new NextRequest('http://localhost/', {
        headers: { 'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8' },
      })
      middleware(req)

      expect(mockRewrite).toHaveBeenCalledTimes(1)
      const rewriteUrl = mockRewrite.mock.calls[0][0] as URL
      expect(rewriteUrl.pathname).toBe('/fr/')
    })

    it('rewrites to the fallback language when nothing matches', () => {
      const middleware = createProxy(internalConfig)
      const req = new NextRequest('http://localhost/about')
      middleware(req)

      expect(mockRewrite).toHaveBeenCalledTimes(1)
      const rewriteUrl = mockRewrite.mock.calls[0][0] as URL
      expect(rewriteUrl.pathname).toBe('/en/about')
    })

    it('serves explicit locale paths as-is (no redirect, no rewrite, header set)', () => {
      const middleware = createProxy(internalConfig)
      const req = new NextRequest('http://localhost/de/about')
      middleware(req)

      expect(mockRedirect).not.toHaveBeenCalled()
      expect(mockRewrite).not.toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalledTimes(1)
      const headers = mockNext.mock.calls[0][0]?.request?.headers as Headers
      expect(headers.get('x-i18next-current-language')).toBe('de')
    })

    it('ignores hideDefaultLocale', () => {
      const middleware = createProxy({ ...internalConfig, hideDefaultLocale: true })
      middleware(new NextRequest('http://localhost/en/about'))

      expect(mockRedirect).not.toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('places the locale segment after basePath', () => {
      const middleware = createProxy({ ...internalConfig, basePath: '/app-router' })
      const req = new NextRequest('http://localhost/app-router/page', {
        cookies: { i18next: 'de' },
      })
      middleware(req)

      expect(mockRewrite).toHaveBeenCalledTimes(1)
      const rewriteUrl = mockRewrite.mock.calls[0][0] as URL
      expect(rewriteUrl.pathname).toBe('/app-router/de/page')
    })

    it('still skips ignored paths', () => {
      const middleware = createProxy(internalConfig)
      const req = new NextRequest('http://localhost/api/health')
      middleware(req)

      expect(mockRewrite).not.toHaveBeenCalled()
      expect(mockRedirect).not.toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalledTimes(1)
    })
  })

  describe('Next.js basePath (next.config)', () => {
    const cfg = { supportedLngs: ['en', 'de'], fallbackLng: 'en' }

    it('keeps the base path in the locale redirect', () => {
      const middleware = createProxy(cfg)
      const req = new NextRequest('http://localhost/nxt/about?tab=1', {
        basePath: '/nxt',
        cookies: { i18next: 'de' },
      })
      middleware(req)

      expect(mockRedirect).toHaveBeenCalledTimes(1)
      expect(String(mockRedirect.mock.calls[0][0])).toBe('http://localhost/nxt/de/about?tab=1')
    })

    it("keeps the base path in the 'internal' rewrite", () => {
      const middleware = createProxy({ ...cfg, localeInPath: 'internal' as const })
      const req = new NextRequest('http://localhost/nxt/about', {
        basePath: '/nxt',
        cookies: { i18next: 'de' },
      })
      middleware(req)

      expect(mockRewrite).toHaveBeenCalledTimes(1)
      expect(String(mockRewrite.mock.calls[0][0])).toBe('http://localhost/nxt/de/about')
    })

    it('keeps the base path in the hideDefaultLocale rewrite and redirect', () => {
      const middleware = createProxy({ ...cfg, hideDefaultLocale: true })
      middleware(new NextRequest('http://localhost/nxt/about', { basePath: '/nxt' }))
      expect(String(mockRewrite.mock.calls[0][0])).toBe('http://localhost/nxt/en/about')

      middleware(new NextRequest('http://localhost/nxt/en/about', { basePath: '/nxt' }))
      expect(String(mockRedirect.mock.calls[0][0])).toBe('http://localhost/nxt/about')
    })

    it('strips the base path from the referer before persisting its locale', () => {
      const middleware = createProxy(cfg)
      const req = new NextRequest('http://localhost/nxt/de/about', {
        basePath: '/nxt',
        headers: { referer: 'http://localhost/nxt/de/' },
      })
      const response = middleware(req)

      expect(mockNext).toHaveBeenCalledTimes(1)
      expect(response.cookies.set).toHaveBeenCalledWith('i18next', 'de', expect.anything())
    })
  })

  describe('language cookie persistence', () => {
    const cfg = { supportedLngs: ['en', 'de', 'fr'], fallbackLng: 'en' }
    const internal = { ...cfg, localeInPath: 'internal' as const }

    it('writes the cookie when the language was detected without one', () => {
      const middleware = createProxy(internal)
      const response = middleware(new NextRequest('http://localhost/about', {
        headers: { 'Accept-Language': 'de' },
      }))

      expect(response.cookies.set).toHaveBeenCalledWith(
        'i18next', 'de', { path: '/', maxAge: 365 * 24 * 60 * 60, sameSite: 'lax' },
      )
    })

    it('skips the rewrite write when the cookie already holds the resolved language', () => {
      const middleware = createProxy(internal)
      const response = middleware(new NextRequest('http://localhost/about', {
        cookies: { i18next: 'de' },
      }))

      expect(mockRewrite).toHaveBeenCalledTimes(1)
      expect(response.cookies.set).not.toHaveBeenCalled()
    })

    it('skips the redirect write when the cookie already matches', () => {
      const middleware = createProxy(cfg)
      const response = middleware(new NextRequest('http://localhost/about', {
        cookies: { i18next: 'de' },
      }))

      expect(mockRedirect).toHaveBeenCalledTimes(1)
      expect(response.cookies.set).not.toHaveBeenCalled()
    })

    it('skips the referer write when the cookie already matches (Server Action POSTs carry a referer)', () => {
      const middleware = createProxy(cfg)
      const response = middleware(new NextRequest('http://localhost/de/about', {
        cookies: { i18next: 'de' },
        headers: { referer: 'http://localhost/de/' },
      }))

      expect(mockNext).toHaveBeenCalledTimes(1)
      expect(response.cookies.set).not.toHaveBeenCalled()
    })

    it('still writes when the cookie holds a different language', () => {
      const middleware = createProxy(internal)
      const response = middleware(new NextRequest('http://localhost/de/about', {
        cookies: { i18next: 'en' },
        headers: { referer: 'http://localhost/de/' },
      }))

      expect(response.cookies.set).toHaveBeenCalledWith('i18next', 'de', expect.anything())
    })

    it('never writes with persistCookie: false but still reads the cookie', () => {
      const middleware = createProxy({ ...internal, persistCookie: false })

      const withCookie = middleware(new NextRequest('http://localhost/about', { cookies: { i18next: 'fr' } }))
      expect(String(mockRewrite.mock.calls[0][0])).toBe('http://localhost/fr/about')
      expect(withCookie.cookies.set).not.toHaveBeenCalled()

      const detected = middleware(new NextRequest('http://localhost/about', { headers: { 'Accept-Language': 'de' } }))
      expect(detected.cookies.set).not.toHaveBeenCalled()
    })

    it('applies cookieOptions on top of the defaults', () => {
      const middleware = createProxy({
        ...cfg,
        cookieOptions: { domain: '.example.com', secure: true, sameSite: 'none' },
      })
      const response = middleware(new NextRequest('http://localhost/about', {
        headers: { 'Accept-Language': 'de' },
      }))

      expect(response.cookies.set).toHaveBeenCalledWith('i18next', 'de', {
        path: '/', maxAge: 365 * 24 * 60 * 60, sameSite: 'none', domain: '.example.com', secure: true,
      })
    })
  })

  describe('hideDefaultLocale with basePath', () => {
    const hideBaseConfig = {
      supportedLngs: ['en', 'de', 'fr'],
      fallbackLng: 'en',
      hideDefaultLocale: true,
      basePath: '/app-router',
    }

    it('rewrites basePath request to default locale internally', () => {
      const middleware = createProxy(hideBaseConfig)
      const req = new NextRequest('http://localhost/app-router/page')
      middleware(req)

      expect(mockRewrite).toHaveBeenCalledTimes(1)
      const rewriteUrl = mockRewrite.mock.calls[0][0] as URL
      expect(rewriteUrl.pathname).toBe('/app-router/en/page')
    })

    it('redirects explicit default locale under basePath', () => {
      const middleware = createProxy(hideBaseConfig)
      const req = new NextRequest('http://localhost/app-router/en/page')
      middleware(req)

      expect(mockRedirect).toHaveBeenCalledTimes(1)
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL
      expect(redirectUrl.pathname).toBe('/app-router/page')
    })

    it('passes through non-default locale under basePath', () => {
      const middleware = createProxy(hideBaseConfig)
      const req = new NextRequest('http://localhost/app-router/de/page')
      middleware(req)

      expect(mockRedirect).not.toHaveBeenCalled()
      expect(mockRewrite).not.toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalledTimes(1)
    })
  })

  describe('basePath', () => {
    const baseConfig = {
      supportedLngs: ['en', 'de', 'fr'],
      fallbackLng: 'en',
      basePath: '/app-router',
    }

    it('skips requests outside the basePath', () => {
      const middleware = createProxy(baseConfig)
      const req = new NextRequest('http://localhost/other/page')
      middleware(req)

      expect(mockRedirect).not.toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalledTimes(1)
      // Should be a plain NextResponse.next() without custom headers
      expect(mockNext.mock.calls[0][0]).toBeUndefined()
    })

    it('skips root path when basePath is set', () => {
      const middleware = createProxy(baseConfig)
      const req = new NextRequest('http://localhost/')
      middleware(req)

      expect(mockRedirect).not.toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalledTimes(1)
      expect(mockNext.mock.calls[0][0]).toBeUndefined()
    })

    it('redirects to add locale after basePath when locale is missing', () => {
      const middleware = createProxy(baseConfig)
      const req = new NextRequest('http://localhost/app-router/page')
      middleware(req)

      expect(mockRedirect).toHaveBeenCalledTimes(1)
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL
      expect(redirectUrl.pathname).toBe('/app-router/en/page')
    })

    it('redirects basePath itself (no trailing content) to basePath/locale', () => {
      const middleware = createProxy(baseConfig)
      const req = new NextRequest('http://localhost/app-router')
      middleware(req)

      expect(mockRedirect).toHaveBeenCalledTimes(1)
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL
      expect(redirectUrl.pathname).toBe('/app-router/en')
    })

    it('does not redirect when locale is already present after basePath', () => {
      const middleware = createProxy(baseConfig)
      const req = new NextRequest('http://localhost/app-router/de/page')
      middleware(req)

      expect(mockRedirect).not.toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('sets header with detected locale from basePath URL', () => {
      const middleware = createProxy(baseConfig)
      const req = new NextRequest('http://localhost/app-router/fr/page')
      middleware(req)

      expect(mockNext).toHaveBeenCalledTimes(1)
      const opts = mockNext.mock.calls[0][0]
      const headers = opts?.request?.headers as Headers
      expect(headers.get('x-i18next-current-language')).toBe('fr')
    })

    it('uses cookie language for redirect under basePath', () => {
      const middleware = createProxy(baseConfig)
      const req = new NextRequest('http://localhost/app-router/page', {
        cookies: { i18next: 'de' },
      })
      middleware(req)

      expect(mockRedirect).toHaveBeenCalledTimes(1)
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL
      expect(redirectUrl.pathname).toBe('/app-router/de/page')
    })

    it('preserves query string in basePath redirect', () => {
      const middleware = createProxy(baseConfig)
      const req = new NextRequest('http://localhost/app-router/page?tab=1')
      middleware(req)

      expect(mockRedirect).toHaveBeenCalledTimes(1)
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL
      expect(redirectUrl.pathname).toBe('/app-router/en/page')
      expect(redirectUrl.search).toBe('?tab=1')
    })

    it('normalizes basePath with extra slashes', () => {
      const middleware = createProxy({
        ...baseConfig,
        basePath: '/app-router/',
      })
      const req = new NextRequest('http://localhost/app-router/page')
      middleware(req)

      expect(mockRedirect).toHaveBeenCalledTimes(1)
      const redirectUrl = mockRedirect.mock.calls[0][0] as URL
      expect(redirectUrl.pathname).toBe('/app-router/en/page')
    })

    it('persists referer language under basePath into cookie', () => {
      const middleware = createProxy(baseConfig)
      const req = new NextRequest('http://localhost/app-router/de/page', {
        headers: { referer: 'http://localhost/app-router/fr/other' },
      })

      const response = middleware(req)

      expect(mockRedirect).not.toHaveBeenCalled()
      expect(response.cookies.set).toHaveBeenCalledWith(
        'i18next',
        'fr',
        expect.objectContaining({ path: '/', sameSite: 'lax' }),
      )
    })
  })
})
