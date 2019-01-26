/* eslint-env jest */

import lngPathCorrector from '../../src/utils/lng-path-corrector'

describe('lngPathCorrector utility function', () => {
  let config
  let i18n
  let currentRoute

  beforeEach(() => {
    config = {
      defaultLanguage: 'en',
      allLanguages: ['en', 'de'],
    }

    i18n = {
      languages: ['en', 'de'],
    }

    currentRoute = {
      asPath: '/',
      query: {},
    }
  })

  it('throws if allLanguages does not include current language', () => {
    config.allLanguages = ['de', 'fr']

    expect(() => lngPathCorrector(config, i18n, currentRoute))
      .toThrowError('Invalid configuration: Current language is not included in all languages array')
  })

  it('strips off the default language', () => {
    currentRoute.asPath = '/en/foo'

    // no 'lng ' parameter needed if this is the default language
    expect(lngPathCorrector(config, i18n, currentRoute)).toEqual(['/foo', {}])
  })

  it('corrects path with language, if not the default', () => {
    currentRoute.asPath = '/foo'

    expect(lngPathCorrector(config, i18n, currentRoute, 'de'))
      .toEqual(['/de/foo', { lng: 'de' }])
  })

  it('adds to query parameters, if some already exist', () => {
    currentRoute.asPath = '/foo'
    currentRoute.query.option1 = 'value1'

    expect(lngPathCorrector(config, i18n, currentRoute, 'de'))
      .toEqual(['/de/foo', { lng: 'de', option1: 'value1' }])

    // no 'lng ' parameter needed if this is the default language
    expect(lngPathCorrector(config, i18n, currentRoute))
      .toEqual(['/foo', { option1: 'value1' }])
  })
})
