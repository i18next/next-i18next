

import { subpathIsRequired } from '../../src/utils'

describe('subpathIsRequired utility function', () => {
  let config

  beforeEach(() => {
    config = {
      defaultLanguage: 'en',
      localeSubpaths: {}
    }
  })

  it('returns false if lng is falsy', () => {
    expect((subpathIsRequired as any)(config)).toBe(false)
  })

  it('returns false is localeSubpaths is set to none', () => {
    config.localeSubpaths = {}
    expect(subpathIsRequired(config, 'en')).toBe(false)
  })

  it('returns false is localeSubpaths is set to foreign and this is default language', () => {
    config.localeSubpaths = {
      de: 'de'
    }
    expect(subpathIsRequired(config, 'en')).toBe(false)
  })

  it('returns true is localeSubpaths is set to foreign and this is not the default language', () => {
    config.localeSubpaths = {
      de: 'de'
    }
    expect(subpathIsRequired(config, 'de')).toBe(true)
  })

  it('returns true is localeSubpaths is set to all', () => {
    config.localeSubpaths = {
      en: 'en',
      de: 'de'
    }
    expect(subpathIsRequired(config, 'en')).toBe(true)
  })
})
