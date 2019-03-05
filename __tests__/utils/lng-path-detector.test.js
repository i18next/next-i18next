/* eslint-env jest */

import testI18NextConfig from '../test-i18next-config'

import lngPathDetector from '../../src/utils/lng-path-detector'
import { localeSubpathOptions } from '../../src/config/default-config'

describe('lngPathDetector utility function', () => {
  let req
  let res

  beforeEach(() => {
    req = {
      i18n: testI18NextConfig,
      url: '/',
    }

    res = {
      redirect: jest.fn(),
      header: jest.fn(),
    }
  })

  it('skips everything if req.i18n is not defined', () => {
    delete req.i18n

    lngPathDetector(req, res)

    expect(res.redirect).not.toBeCalled()
  })

  it('changes language if url starts with language and is not languages[0]', () => {
    req.url = '/de/foo'

    lngPathDetector(req, res)

    expect(req.i18n.changeLanguage).toBeCalledWith('de')

    expect(res.redirect).not.toBeCalled()
  })

  it('performs language change if url starts with a locale subpath of a different locale', () => {
    req.i18n.languages = ['de', 'en']
    req.url = '/en/foo?test=123'

    lngPathDetector(req, res)

    expect(req.i18n.changeLanguage).toBeCalledWith('en')

    expect(res.redirect).not.toBeCalledWith()
  })

  it('strips language off url and redirects if language is languages[0]', () => {
    req.i18n.languages = ['en', 'de']
    req.url = '/en/foo'

    lngPathDetector(req, res, true)

    expect(req.i18n.changeLanguage).not.toBeCalledWith()

    expect(res.redirect).toBeCalledWith(302, '/foo')
  })

  it(`does not redirect if language is languages[0] and localeSubpaths is "${localeSubpathOptions.ALL}"`, () => {
    req.i18n.languages = ['en', 'de']
    req.i18n.options.localeSubpaths = localeSubpathOptions.ALL
    req.url = '/en/foo'

    lngPathDetector(req, res, true)

    expect(res.redirect).not.toBeCalled()
  })
})
