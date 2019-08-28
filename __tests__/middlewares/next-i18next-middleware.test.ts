import i18nextMiddleware from 'i18next-express-middleware'

import testI18NextConfig from '../test-i18next-config'

import nextI18nextMiddleware from '../../src/middlewares/next-i18next-middleware'
import { localeSubpathVariations } from '../config/test-helpers'

const redirectWithoutCache: jest.Mock = require('../../src/utils').redirectWithoutCache
const lngFromReq: jest.Mock = require('../../src/utils').lngFromReq
const subpathFromLng: jest.Mock = require('../../src/utils').subpathFromLng
const subpathIsRequired: jest.Mock = require('../../src/utils').subpathIsRequired
const subpathIsPresent: jest.Mock = require('../../src/utils').subpathIsPresent
const removeSubpath: jest.Mock = require('../../src/utils').removeSubpath
const addSubpath: jest.Mock = require('../../src/utils').addSubpath

jest.mock('i18next-express-middleware', () => ({
  handle: jest.fn(() => jest.fn()),
}))

jest.mock('../../src/utils', () => ({
  redirectWithoutCache: jest.fn(),
  subpathIsRequired: jest.fn(),
  subpathIsPresent: jest.fn(),
  subpathFromLng: jest.fn(),
  lngFromReq: jest.fn(),
  removeSubpath: jest.fn(),
  isServer: jest.fn(),
  addSubpath: jest.fn()
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
    res = {
      redirect: jest.fn(),
      header: jest.fn()
    }
    next = jest.fn()
  })

  afterEach(() => {
    i18nextMiddleware.handle.mockClear()

    redirectWithoutCache.mockReset()
    subpathIsRequired.mockReset()
    subpathIsPresent.mockReset()
    subpathFromLng.mockReset()
    lngFromReq.mockReset()
    removeSubpath.mockReset()
    addSubpath.mockReset()
    res.redirect.mockReset()
    res.header.mockReset()
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
          ignoreRoutes: expect.arrayContaining(['/_next/', '/static/']),
        }))
  })

  it(`does not call any next-i18next middleware if localeSubpaths is "${localeSubpathVariations.NONE}"`, () => {
    nexti18next.config.localeSubpaths = localeSubpathVariations.NONE

    callAllMiddleware()
  })

  describe(`localeSubpaths = "${localeSubpathVariations.FOREIGN}"`, () => {
    beforeEach(() => {
      nexti18next.config.localeSubpaths = localeSubpathVariations.FOREIGN
    })

    it('does not call middleware, if route to ignore', () => {
      req.url = '/_next/route'

      callAllMiddleware()

      expect(next).toBeCalled()
    })

    it('adds lng to query parameters and removes from url for i18next processing', () => {

      const language = 'de'
      const subpath = 'german'
      req = {
        url: `/${subpath}/page1`,
        query: {},
        i18n: {
          options: {
            localeSubpaths: {
              [language]: subpath,
            }
          }
        }
      }

      subpathIsRequired.mockReturnValue(true)
      subpathIsPresent.mockReturnValue(true)
      lngFromReq.mockReturnValue(language)
      subpathFromLng.mockReturnValue(subpath)
      removeSubpath.mockReturnValue('/page1')

      callAllMiddleware()

      expect(req.url).toBe('/page1')
      expect(req.query).toEqual({
        lng: language,
        subpath,
      })

      expect(subpathIsRequired).toHaveBeenCalledTimes(1)
      expect(subpathIsPresent).toHaveBeenCalledTimes(1)
      expect(lngFromReq).toHaveBeenCalledTimes(1)
      expect(subpathFromLng).toHaveBeenCalledTimes(1)
      expect(removeSubpath).toHaveBeenCalledTimes(1)
      expect(next).toBeCalledTimes(1)
    })

    it('redirect to locale subpath when subpath was not present', () => {

      const language = 'de'
      const subpath = 'german'
      req = {
        url: `/page1`,
        query: {},
        i18n: {
          options: {
            localeSubpaths: {
              [language]: subpath,
            }
          }
        }
      }

      subpathIsRequired.mockReturnValue(true)
      subpathIsPresent.mockReturnValue(false)
      lngFromReq.mockReturnValue(language)
      subpathFromLng.mockReturnValue(subpath)
      addSubpath.mockReturnValue(`/${subpath}/page1`)

      callAllMiddleware()

      expect(req.url).toBe('/page1')
      expect(req.query).toEqual({})

      expect(removeSubpath).toHaveBeenCalledTimes(0)
      expect(redirectWithoutCache).toHaveBeenCalledWith(res, '/german/page1')
      expect(addSubpath).toHaveBeenCalledTimes(1)
      expect(subpathIsRequired).toHaveBeenCalledTimes(1)
      expect(subpathIsPresent).toHaveBeenCalledTimes(3)
      expect(lngFromReq).toHaveBeenCalledTimes(1)
      expect(subpathFromLng).toHaveBeenCalledTimes(3)
      expect(removeSubpath).toHaveBeenCalledTimes(0)
      expect(next).toBeCalledTimes(0)
    })
  })
})
