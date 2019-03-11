/* eslint-env jest */

import analyseFallbackLanguageConfiguration from '../../src/utils/fallback-lng-analysis'

describe('analyseFallbackLanguageConfiguration utility function', () => {

  it('returns only initialLng if fallbackLng equals', () => {
    const analysis = analyseFallbackLanguageConfiguration('en', 'en')
    expect(analysis).toMatchObject(['en'])
  })

  it('returns both initialLng and fallbackLng if differs', () => {
    const analysis = analyseFallbackLanguageConfiguration('de', 'en')
    expect(analysis).toMatchObject(['en', 'de'])
  })

  it('returns locale specific fallbackLng', () => {
    const analysis = analyseFallbackLanguageConfiguration({ 'en-BE': 'en' }, 'en-BE')
    expect(analysis).toMatchObject(['en-BE', 'en'])
  })

  it('returns locale specific fallbackLng and default', () => {
    const analysis = analyseFallbackLanguageConfiguration({ 'de-BE': 'de', default: 'en' }, 'de-BE')
    expect(analysis).toMatchObject(['de-BE', 'de', 'en'])
  })

  it('returns locale specific fallbackLng array', () => {
    const analysis = analyseFallbackLanguageConfiguration({ 'fi-FI': ['fi', 'en'] }, 'fi-FI')
    expect(analysis).toMatchObject(['fi-FI', 'fi', 'en'])
  })

  it('returns locale specific fallbackLng array and default', () => {
    const analysis = analyseFallbackLanguageConfiguration({ 'fi-FI': ['fi', 'en'], default: 'it' }, 'fi-FI')
    expect(analysis).toMatchObject(['fi-FI', 'fi', 'en', 'it'])
  })

})
