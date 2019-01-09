/* eslint-env jest */

import i18nextMiddleware from 'i18next-express-middleware'
import { forceTrailingSlash, handleLanguageSubpath, lngPathDetector } from 'utils'
import testConfig from '../test-config'

import nextI18nextMiddleware from '../../src/middlewares/next-i18next-middleware'

jest.mock('i18next-express-middleware', () => ({
  handle: jest.fn(() => 'i18nextMiddleware'),
}))

jest.mock('utils', () => ({
  forceTrailingSlash: jest.fn(() => 'forceTrailingSlash'),
  handleLanguageSubpath: jest.fn(() => 'handleLanguageSubpath'),
  lngPathDetector: jest.fn(() => 'lngPathDetector'),
}))

jest.mock('url', () => ({
  parse: jest.fn(),
}))

describe('next-18next middleware', () => {
  let nexti18next

  beforeEach(() => {
    nexti18next = {
      config: { ...testConfig.options },
      i18n: 'i18n',
    }
  })

  it('returns i18nextMiddleware without localeSubpath middleware if localeSubpaths is false', () => {
    nexti18next.config.localeSubpaths = false

    const middleware = nextI18nextMiddleware(nexti18next)

    expect(i18nextMiddleware.handle)
      .toBeCalledWith('i18n',
        expect.objectContaining({
          ignoreRoutes: expect.arrayContaining(['/_next', '/static']),
        }))

    expect(middleware).toEqual(['i18nextMiddleware'])
  })

  it('returns i18nextMiddleware with localeSubpath middleware if localeSubpaths is true', () => {
    nexti18next.config.localeSubpaths = true

    const middleware = nextI18nextMiddleware(nexti18next)

    expect(i18nextMiddleware.handle)
      .toBeCalledWith('i18n',
        expect.objectContaining({
          ignoreRoutes: expect.arrayContaining(['/_next', '/static']),
        }))

    expect(forceTrailingSlash).toBeCalledWith(['en', 'de'], /^\/(?!_next|static).*$/)
    expect(lngPathDetector).toBeCalledWith(/^\/(?!_next|static).*$/)
    expect(handleLanguageSubpath).toBeCalledWith(['en', 'de'])

    expect(middleware).toEqual([
      'i18nextMiddleware', 'forceTrailingSlash', 'lngPathDetector', 'handleLanguageSubpath',
    ])
  })
})
