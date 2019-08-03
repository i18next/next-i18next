import { localeSubpathOptions } from '../../src/config/default-config'

import { localeSubpathRequired } from '../../src/utils'

describe('localeSubpathRequired utility function', () => {
  let nextI18NextInternals

  beforeEach(() => {
    nextI18NextInternals = {
      config: {
        defaultLanguage: 'en',
        localeSubpaths: localeSubpathOptions.NONE,
      },
    }
  })

  it('returns false if lng is falsy', () => {
    expect((localeSubpathRequired as any)(nextI18NextInternals)).toBe(false)
  })

  it('returns false is localeSubpaths is set to none', () => {
    nextI18NextInternals.config.localeSubpaths = localeSubpathOptions.NONE
    expect(localeSubpathRequired(nextI18NextInternals, 'en')).toBe(false)
  })

  it('returns false is localeSubpaths is set to foreign and this is default language', () => {
    nextI18NextInternals.config.localeSubpaths = localeSubpathOptions.FOREIGN
    expect(localeSubpathRequired(nextI18NextInternals, 'en')).toBe(false)
  })

  it('returns true is localeSubpaths is set to foreign and this is not the default language', () => {
    nextI18NextInternals.config.localeSubpaths = localeSubpathOptions.FOREIGN
    expect(localeSubpathRequired(nextI18NextInternals, 'de')).toBe(true)
  })

  it('returns true is localeSubpaths is set to all', () => {
    nextI18NextInternals.config.localeSubpaths = localeSubpathOptions.ALL
    expect(localeSubpathRequired(nextI18NextInternals, 'en')).toBe(true)
  })
})
