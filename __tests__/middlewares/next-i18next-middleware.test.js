/* eslint-env jest */

import i18nextMiddleware from 'i18next-express-middleware'
import { forceTrailingSlash, lngPathDetector, redirectWithoutCache } from '../../src/utils'
import testI18NextConfig from '../test-i18next-config'

import nextI18nextMiddleware from '../../src/middlewares/next-i18next-middleware'
import { localeSubpathOptions } from '../../src/config/default-config'

jest.mock('i18next-express-middleware', () => ({
  handle: jest.fn(() => jest.fn()),
}))

jest.mock('../../src/utils', () => ({
  forceTrailingSlash: jest.fn(),
  lngPathDetector: jest.fn(),
  redirectWithoutCache: jest.fn(),
}))

describe('next-18next middleware', () => {
  let nexti18next
  let req
  let res
  let next

  beforeEach(() => {
    nexti18next = {
      config: testI18NextConfig.options,
      i18n: 'i18n',
    }

    req = {
      url: '/myapp.com/',
    }
    res = {}
    next = jest.fn()

    lngPathDetector.mockImplementation(() => ({
      originalUrl: '/page',
      correctedUrl: '/page',
    }))
  })

  afterEach(() => {
    i18nextMiddleware.handle.mockClear()

    forceTrailingSlash.mockReset()
    lngPathDetector.mockReset()
    redirectWithoutCache.mockReset()
  })

  const callAllMiddleware = () => {
    const middlewareFunctions = nextI18nextMiddleware(nexti18next)

    middlewareFunctions.forEach((middleware, index) => {
      // only call next middleware if this is the first request or if next() was called
      if (index === 0 || next.mock.calls.length === index - 1) {
        middleware(req, res, next)
      }
    })
  }

  it('sets up i18nextMiddleware handle on setup', () => {
    callAllMiddleware()

    expect(i18nextMiddleware.handle)
      .toBeCalledWith('i18n',
        expect.objectContaining({
          ignoreRoutes: expect.arrayContaining(['/_next', '/static']),
        }))
  })

  it(`does not call any next-i18next middleware if localeSubpaths is "${localeSubpathOptions.NONE}"`, () => {
    nexti18next.config.localeSubpaths = localeSubpathOptions.NONE

    callAllMiddleware()

    expect(forceTrailingSlash).not.toBeCalled()
    expect(lngPathDetector).not.toBeCalled()
  })

  describe(`localeSubpaths = "${localeSubpathOptions.FOREIGN}"`, () => {
    beforeEach(() => {
      nexti18next.config.localeSubpaths = localeSubpathOptions.FOREIGN
    })

    it('does not call middleware, if route to ignore', () => {
      req.url = '/_next/route'

      callAllMiddleware()

      expect(forceTrailingSlash).not.toBeCalled()
      expect(lngPathDetector).not.toBeCalled()

      expect(next).toBeCalled()
    })

    it('calls forceTrailingSlash if root locale route without slash', () => {
      req.url = '/de'

      callAllMiddleware()

      expect(forceTrailingSlash).toBeCalledWith(req, res, 'de')

      expect(next).not.toBeCalled()
    })

    it('does not call forceTrailingSlash if root locale route with slash', () => {
      req.url = '/de/'

      callAllMiddleware()

      expect(forceTrailingSlash).not.toBeCalled()

      expect(next).toBeCalledTimes(3)
    })

    describe('lngPathDetector', () => {
      it('calls lngPathDetector if not a route to ignore', () => {
        req.url = '/page/'

        callAllMiddleware()

        expect(lngPathDetector).toBeCalledWith(req)

        expect(next).toBeCalledTimes(3)
      })

      it('does not call next() if lngPathDetector redirects', () => {
        req.url = '/page/'
        lngPathDetector.mockImplementation(() => ({
          originalUrl: '/page/',
          correctedUrl: '/de/page/',
        }))

        callAllMiddleware()

        expect(lngPathDetector).toBeCalledWith(req)
        expect(redirectWithoutCache).toBeCalledWith(res, '/de/page/')

        expect(next).toBeCalledTimes(1)
      })

      it('calls next() if lngPathDetector does not redirect', () => {
        req.url = '/page/'
        lngPathDetector.mockImplementation(() => ({
          originalUrl: '/page/',
          correctedUrl: '/page/',
        }))

        callAllMiddleware()

        expect(lngPathDetector).toBeCalledWith(req)
        expect(redirectWithoutCache).not.toBeCalled()

        expect(next).toBeCalledTimes(3)
      })

      it('does not call lngPathDetector if a route to ignore', () => {
        req.url = '/static/locales/en/common.js'

        callAllMiddleware()

        expect(lngPathDetector).not.toBeCalled()

        expect(next).toBeCalledTimes(3)
      })
    })

    it('adds lng to query parameters and removes from url for i18next processing', () => {
      req = {
        url: '/de/page1',
        query: {},
      }

      callAllMiddleware()

      expect(req.url).toBe('/page1')
      expect(req.query).toEqual({ lng: 'de' })

      expect(next).toBeCalledTimes(3)
    })
  })
})
