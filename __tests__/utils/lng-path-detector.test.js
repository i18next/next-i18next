/* eslint-env jest */

import testI18NextConfig from '../test-i18next-config'

import lngPathDetector from '../../src/utils/lng-path-detector'
import { localeSubpathOptions } from '../../src/config/default-config'

describe('lngPathDetector utility function', () => {
  let req

  beforeEach(() => {
    req = {
      i18n: testI18NextConfig,
      url: '/',
    }
  })

  it('skips everything if req.i18n is not defined', () => {
    req.url = '/foo'
    delete req.i18n

    const config = lngPathDetector(req)

    expect(config.correctedUrl).toBe(config.originalUrl)
  })

  it('changes language if url starts with language and is not languages[0]', () => {
    req.url = '/de/foo'

    const config = lngPathDetector(req)

    expect(req.i18n.changeLanguage).toBeCalledWith('de')

    expect(config.correctedUrl).toBe(config.originalUrl)
  })

  it('performs language change if url starts with a locale subpath of a different locale', () => {
    req.i18n.languages = ['de', 'en']
    req.url = '/en/foo?test=123'

    const config = lngPathDetector(req)

    expect(req.i18n.changeLanguage).toBeCalledWith('en')

    expect(config.correctedUrl).toBe(config.originalUrl)
  })

  it('strips language off url and redirects if language is languages[0]', () => {
    req.i18n.languages = ['en', 'de']
    req.url = '/en/foo'

    const config = lngPathDetector(req)

    expect(req.i18n.changeLanguage).not.toBeCalledWith()

    expect(config.correctedUrl).not.toBe(config.originalUrl)
    expect(config.originalUrl).toBe('/en/foo')
    expect(config.correctedUrl).toBe('/foo')
  })

  it(`does not redirect if language is languages[0] and localeSubpaths is "${localeSubpathOptions.ALL}"`, () => {
    req.i18n.languages = ['en', 'de']
    req.i18n.options.localeSubpaths = localeSubpathOptions.ALL
    req.url = '/en/foo'

    const config = lngPathDetector(req)

    expect(config.correctedUrl).toBe(config.originalUrl)
  })
})
