/* eslint-env jest */

import testConfig from '../test-config'

import lngPathDetectorMiddleware from '../../src/utils/lng-path-detector'

describe('lngPathDetector utility function', () => {
  const ignoreRegex = /^\/(?!_next|static).*$/
  let lngPathDetector
  let req
  let res
  let next

  beforeEach(() => {
    lngPathDetector = lngPathDetectorMiddleware(ignoreRegex)

    req = {
      i18n: { ...testConfig },
      url: '/',
    }

    res = {
      redirect: jest.fn(),
      header: jest.fn(),
    }

    next = jest.fn()
  })

  it('skips everything if req.i18n is not defined', () => {
    delete req.i18n

    lngPathDetector(req, res, next)

    expect(res.redirect).not.toBeCalled()

    expect(next).toBeCalled()
  })

  it('skips everything if url is one we should ignore', () => {
    req.url = '/static'

    lngPathDetector(req, res, next)

    expect(res.redirect).not.toBeCalled()

    expect(next).toBeCalled()
  })

  it('changes language if url starts with langauge and is not languages[0]', () => {
    req.url = '/de/foo'

    lngPathDetector(req, res, next)

    expect(req.i18n.changeLanguage).toBeCalledWith('de')

    expect(res.redirect).not.toBeCalled()

    expect(next).toBeCalled()
  })

  it('performs language change if url starts with a locale subpath of a different locale', () => {
    req.i18n.languages = ['de', 'en']
    req.url = '/en/foo?test=123'

    lngPathDetector(req, res, next)

    expect(req.i18n.changeLanguage).toBeCalledWith('en')

    expect(next).toBeCalled()
  })

  it('strips language off url and redirects if langauge is languages[0]', () => {
    req.url = '/en/foo'

    lngPathDetector(req, res, next)

    expect(req.i18n.changeLanguage).not.toBeCalledWith()

    expect(res.redirect).toBeCalledWith(302, '/foo')

    expect(next).toBeCalled()
  })
})
