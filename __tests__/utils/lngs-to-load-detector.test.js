/* eslint-env jest */
import lngsToLoadDetector from '../../src/utils/lngs-to-load-detector'

describe('lngsToLoadDetector utility function', () => {

  it('returns only initialLng if fallbackLng equals', () => {
    const analysis = lngsToLoadDetector('en', 'en')
    expect(analysis).toMatchObject(['en'])
  })

  it('returns both initialLng and fallbackLng if differs', () => {
    const analysis = lngsToLoadDetector('en', 'de')
    expect(analysis).toMatchObject(['en', 'de'])
  })

  it('returns fallbackLng array and initial', () => {
    const analysis = lngsToLoadDetector('en-BE', ['en', 'nl'])
    expect(analysis).toMatchObject(['en-BE', 'en', 'nl'])
  })

  it('returns locale specific fallbackLng', () => {
    const analysis = lngsToLoadDetector('en-BE', { 'en-BE': 'en' })
    expect(analysis).toMatchObject(['en-BE', 'en'])
  })

  it('returns locale specific fallbackLng and default', () => {
    const analysis = lngsToLoadDetector('de-BE', { 'de-BE': 'de', default: 'en' })
    expect(analysis).toMatchObject(['de-BE', 'de', 'en'])
  })

  it('returns locale specific fallbackLng array', () => {
    const analysis = lngsToLoadDetector('fi-FI', { 'fi-FI': ['fi', 'en'] })
    expect(analysis).toMatchObject(['fi-FI', 'fi', 'en'])
  })

  it('returns locale specific fallbackLng array and default', () => {
    const analysis = lngsToLoadDetector('fi-FI', { 'fi-FI': ['fi', 'en'], default: 'it' })
    expect(analysis).toMatchObject(['fi-FI', 'fi', 'en', 'it'])
  })

})
