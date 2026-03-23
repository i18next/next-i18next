/**
 * @jest-environment node
 */

// Mock next/server before importing the module under test
const mockRedirect = jest.fn()
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

    static next(opts?: { request?: { headers?: Headers } }) {
      const resp = new MockNextResponse()
      mockNext(opts)
      return resp
    }
  }

  class MockNextRequest {
    nextUrl: { pathname: string; search: string }
    url: string
    cookies: {
      get: jest.Mock
    }

    headers: Headers

    constructor(url: string, opts: { headers?: Record<string, string>; cookies?: Record<string, string> } = {}) {
      const parsed = new URL(url)
      this.nextUrl = { pathname: parsed.pathname, search: parsed.search }
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
