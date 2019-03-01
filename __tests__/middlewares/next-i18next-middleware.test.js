/* eslint-env jest */

import i18nextMiddleware from 'i18next-express-middleware'
import { forceTrailingSlash, lngPathDetector } from '../../src/utils'
import testI18NextConfig from '../test-i18next-config'

import nextI18nextMiddleware from '../../src/middlewares/next-i18next-middleware'
import { localeSubpathOptions } from '../../src/config/default-config'

jest.mock('i18next-express-middleware', () => ({
  handle: jest.fn(() => jest.fn()),
}))

jest.mock('../../src/utils', () => ({
  forceTrailingSlash: jest.fn(),
  lngPathDetector: jest.fn(),
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
  })

  afterEach(() => {
    i18nextMiddleware.handle.mockClear()

    forceTrailingSlash.mockReset()
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
  })
})
