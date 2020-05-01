import i18nextMiddleware from 'i18next-http-middleware'

import testI18NextConfig from '../test-i18next-config'

import nextI18nextMiddleware from '../../src/middlewares/next-i18next-middleware'
import { localeSubpathVariations } from '../config/test-helpers'

jest.mock('i18next-http-middleware', () => ({
  handle: jest.fn(() => jest.fn()),
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
      i18n: testI18NextConfig
    }
    res = {
      end: jest.fn(),
      writeHead: jest.fn(),
      setHeader: jest.fn()
    }
    next = jest.fn()
  })

  afterEach(() => {
    i18nextMiddleware.handle.mockClear()

    res.writeHead.mockReset()
    res.setHeader.mockReset()
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

    expect(i18nextMiddleware.handle).toBeCalledWith('i18n')
  })

  it(`does not call any next-i18next middleware if localeSubpaths is "${JSON.stringify(localeSubpathVariations.NONE)}"`, () => {
    nexti18next.config.localeSubpaths = localeSubpathVariations.NONE

    callAllMiddleware()
  })

  describe(`localeSubpaths = "${JSON.stringify(localeSubpathVariations.FOREIGN)}"`, () => {
    beforeEach(() => {
      nexti18next.config.localeSubpaths = localeSubpathVariations.FOREIGN
    })

    it('does not call middleware, if route to ignore', () => {
      req.url = '/_next/route'

      callAllMiddleware()

      expect(next).toBeCalled()
      expect(req.i18n).toBeDefined()
    })

    it('adds lng to query parameters', () => {
      const language = 'de'
      const subpath = 'german'
      req = {
        url: `/${subpath}/page1`,
        query: {},
        i18n: {
          ...testI18NextConfig,
          options: {
            ...testI18NextConfig.options,
            localeSubpaths: {
              [language]: subpath,
            }
          }
        }
      }

      callAllMiddleware()

      expect(req.url).toBe('/german/page1')

      expect(next).toBeCalledTimes(1)
    })

    it('redirect to locale subpath when subpath was not present', () => {

      const language = 'de'
      const subpath = 'german'
      req = {
        url: `/page1`,
        query: {},
        i18n: {
          ...testI18NextConfig,
          languages: [language],
          options: {
            ...testI18NextConfig.options,
            localeSubpaths: {
              [language]: subpath,
            }
          }
        }
      }

      callAllMiddleware()

      expect(req.url).toBe('/page1')
      expect(req.query).toEqual({})

      expect(res.writeHead).toHaveBeenCalledWith(302, { Location: '/german/page1' })
      expect(res.setHeader).toHaveBeenNthCalledWith(1, 'Cache-Control', 'private, no-cache, no-store, must-revalidate')
      expect(res.setHeader).toHaveBeenNthCalledWith(2, 'Expires', '-1')
      expect(res.setHeader).toHaveBeenNthCalledWith(3, 'Pragma', 'no-cache')
      expect(next).toBeCalledTimes(0)
    })

    it('should not removes lang subpath from url when not required', () => {
      const language = 'de'
      const subpath = 'german'
      const url = `/${subpath}page1`
      req = {
        url,
        query: {},
        i18n: {
          ...testI18NextConfig,
          options: {
            ...testI18NextConfig.options,
            localeSubpaths: {
              [language]: subpath,
            }
          }
        }
      }

      callAllMiddleware()

      expect(req.url).toBe(url)
      expect(next).toBeCalledTimes(1)
    })
  })
})
