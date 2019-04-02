/* eslint-env jest */
import lngsToLoad from '../../src/utils/lngs-to-load'

describe('lngsToLoad utility function', () => {

  it('returns only initialLng if fallbackLng equals', () => {
    const analysis = lngsToLoad('en', 'en')
    expect(analysis).toMatchObject(['en'])
  })

  it('returns both initialLng and fallbackLng if differs', () => {
    const analysis = lngsToLoad('en', 'de')
    expect(analysis).toMatchObject(['en', 'de'])
  })

  it('returns fallbackLng array and initial', () => {
    const analysis = lngsToLoad('en-BE', ['en', 'nl'])
    expect(analysis).toMatchObject(['en-BE', 'en', 'nl'])
  })

  it('returns locale specific fallbackLng', () => {
    const analysis = lngsToLoad('en-BE', { 'en-BE': 'en' })
    expect(analysis).toMatchObject(['en-BE', 'en'])
  })

  it('returns locale specific fallbackLng and default', () => {
    const analysis = lngsToLoad('de-BE', { 'de-BE': 'de', default: 'en' })
    expect(analysis).toMatchObject(['de-BE', 'de', 'en'])
  })

  it('returns locale specific fallbackLng array', () => {
    const analysis = lngsToLoad('fi-FI', { 'fi-FI': ['fi', 'en'] })
    expect(analysis).toMatchObject(['fi-FI', 'fi', 'en'])
  })

  it('returns locale specific fallbackLng array and default', () => {
    const analysis = lngsToLoad('fi-FI', { 'fi-FI': ['fi', 'en'], default: 'it' })
    expect(analysis).toMatchObject(['fi-FI', 'fi', 'en', 'it'])
  })

})
