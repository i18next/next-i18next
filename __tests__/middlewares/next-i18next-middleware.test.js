/* eslint-env jest */

import i18nextMiddleware from 'i18next-express-middleware'
import { forceTrailingSlash, handleLanguageSubpath, lngPathDetector } from 'utils'
import testConfig from '../test-config'

import nextI18nextMiddleware from '../../src/middlewares/next-i18next-middleware'

jest.mock('i18next-express-middleware', () => ({
  handle: jest.fn(() => jest.fn()),
}))

jest.mock('utils', () => ({
  forceTrailingSlash: jest.fn(),
  handleLanguageSubpath: jest.fn(),
  lngPathDetector: jest.fn(),
}))

describe('next-18next middleware', () => {
  let nexti18next
  let req
  let res
  let next

  beforeEach(() => {
    nexti18next = {
      config: { ...testConfig.options },
      i18n: 'i18n',
    }

    req = {
      url: '/myapp.com/',
    }
    res = {}
    next = jest.fn()
  })

  afterEach(() => {
    i18nextMiddleware.handle.mockClear()

    forceTrailingSlash.mockReset()
    handleLanguageSubpath.mockReset()
    lngPathDetector.mockReset()
  })

  const callAllMiddleware = () => {
    const middlewareFunctions = nextI18nextMiddleware(nexti18next)

    middlewareFunctions.forEach((middleware) => {
      middleware(req, res, next)
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

  it('does not call any next-i18next middleware if localeSubpaths === false', () => {
    nexti18next.config.localeSubpaths = false

    callAllMiddleware()

    expect(forceTrailingSlash).not.toBeCalled()
    expect(lngPathDetector).not.toBeCalled()
    expect(handleLanguageSubpath).not.toBeCalled()
  })

  describe('localeSubpaths === true', () => {
    beforeEach(() => {
      nexti18next.config.localeSubpaths = true
    })

    it('does not call middleware, if route to ignore', () => {
      req.url = '/_next/route'

      callAllMiddleware()

      expect(forceTrailingSlash).not.toBeCalled()
      expect(lngPathDetector).not.toBeCalled()
      expect(handleLanguageSubpath).not.toBeCalled()

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

      expect(next).toBeCalled()
    })

    it('calls lngPathDetector if not a route to ignore', () => {
      req.url = '/page/'

      callAllMiddleware()

      expect(lngPathDetector).toBeCalledWith(req, res)

      expect(next).toBeCalled()
    })

    it('does not call lngPathDetector if a route to ignore', () => {
      req.url = '/static/locales/en/common.js'

      callAllMiddleware()

      expect(lngPathDetector).not.toBeCalled()

      expect(next).toBeCalled()
    })

    it('calls handleLanguageSubpath if a locale subpath route', () => {
      req.url = '/de/page/'

      callAllMiddleware()

      expect(handleLanguageSubpath).toBeCalledWith(req, 'de')

      expect(next).toBeCalled()
    })

    it('does not call handleLanguageSubpath if not a locale subpath route', () => {
      req.url = '/page/'

      callAllMiddleware()

      expect(handleLanguageSubpath).not.toBeCalled()

      expect(next).toBeCalled()
    })
  })
})
