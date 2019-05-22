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
    const analysis = lngsToLoad('fi', ['en', 'nl'])
    expect(analysis).toMatchObject(['fi', 'en', 'nl'])
  })

  it('returns locale specific fallbackLng', () => {
    const analysis = lngsToLoad('nl', { nl: 'en', sv: 'da' })
    expect(analysis).toMatchObject(['nl', 'en'])
  })

  it('returns locale specific fallbackLng and default', () => {
    const analysis = lngsToLoad('fr', { fr: 'de', default: 'en' })
    expect(analysis).toMatchObject(['fr', 'de', 'en'])
  })

  it('returns locale specific fallbackLng array', () => {
    const analysis = lngsToLoad('fi', { fi: ['dk', 'sv', 'en'] })
    expect(analysis).toMatchObject(['fi', 'dk', 'sv', 'en'])
  })

  it('returns locale specific fallbackLng array and default', () => {
    const analysis = lngsToLoad('fi', { fi: ['dk', 'en'], default: 'it' })
    expect(analysis).toMatchObject(['fi', 'dk', 'en', 'it'])
  })

  it('returns correctly when fallbackLng is undefined', () => {
    expect(lngsToLoad('fi', undefined)).toMatchObject(['fi'])
  })

  it('returns correctly when initialLng is undefined', () => {
    expect(lngsToLoad(undefined, { default: 'it' })).toMatchObject(['it'])
    expect(lngsToLoad(undefined, { it: ['dk', 'en'] })).toMatchObject([])
  })

  it('returns main language when initialLng is locale specific', () => {
    const analysis = lngsToLoad('fr-FR', 'en', ['fr', 'nl', 'de', 'fr-BE', 'en-US'])
    expect(analysis).toMatchObject(['fr-FR', 'en', 'fr'])
  })
})
