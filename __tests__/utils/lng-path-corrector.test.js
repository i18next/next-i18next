/* eslint-env jest */

import lngPathCorrector from '../../src/utils/lng-path-corrector'

describe('lngPathCorrector utility function', () => {
  let config
  let i18n
  let query

  beforeEach(() => {
    config = {
      defaultLanguage: 'en',
      allLanguages: ['en', 'de'],
    }

    i18n = {
      languages: ['en', 'de'],
    }

    query = {}
  })

  it('throws if allLanguages does not include current language', () => {
    config.allLanguages = ['de', 'fr']

    expect(() => lngPathCorrector(config, i18n, '/', query))
      .toThrowError('Invalid configuration: Current language is not included in all languages array')
  })

  it('strips off the default language', () => {
    expect(lngPathCorrector(config, i18n, '/en/foo', query)).toEqual(['/foo', { lng: 'en' }])
  })

  it('corrects path with language, if not the default', () => {
    expect(lngPathCorrector(config, i18n, '/foo', query, 'de'))
      .toEqual(['/de/foo', { lng: 'de' }])
  })

  it('adds to query parameters, if some already exist', () => {
    query.option1 = 'value1'

    expect(lngPathCorrector(config, i18n, '/foo', query, 'de'))
      .toEqual(['/de/foo', { lng: 'de', option1: 'value1' }])

    expect(lngPathCorrector(config, i18n, '/foo', query))
      .toEqual(['/foo', { lng: 'en', option1: 'value1' }])
  })
})
