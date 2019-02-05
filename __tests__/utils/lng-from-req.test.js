/* eslint-env jest */

import lngFromReq from '../../src/utils/lng-from-req'

describe('lngFromReq utility function', () => {
  let req

  beforeEach(() => {
    req = {
      i18n: {
        options: {
          allLanguages: ['en', 'de'],
          defaultLanguage: 'en',
          fallbackLng: [],
        },
      },
    }
  })

  it('returns first language if available', () => {

    req.i18n.languages = ['en']
    const language = lngFromReq(req)

    expect(language).toBe('en')

  })

  it('returns second language if first is not available', () => {

    req.i18n.languages = ['nl', 'de']
    const language = lngFromReq(req)

    expect(language).toBe('de')

  })

  it('returns fallback language if no others are available', () => {

    req.i18n.languages = ['nl']
    req.i18n.options.fallbackLng = ['es']
    const language = lngFromReq(req)

    expect(language).toBe('es')

  })

  it('returns default language if no others are available and no fallback language', () => {

    req.i18n.languages = ['nl']
    const language = lngFromReq(req)

    expect(language).toBe('en')

  })

  it('returns fallback language if i18n.languages is not an array', () => {

    req.i18n.languages = null
    req.i18n.options.fallbackLng = ['es']
    const language = lngFromReq(req)

    expect(language).toBe('es')

  })

  it('returns default language if i18n.languages is not an array and no fallback language', () => {

    req.i18n.languages = null
    const language = lngFromReq(req)

    expect(language).toBe('en')

  })
})
