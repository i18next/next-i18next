import { subpathFromLng } from '../../src/utils'
import { Config } from '../../types'

describe('subpathFromLng utility function', () => {
  it('returns null if locale subpath is not provided for language', () => {
    expect(subpathFromLng({
      localeSubpaths: {}
    } as Config, 'en')).toBe(null)
  })

  it('returns null if language is not a string', () => {
    expect(subpathFromLng({
      localeSubpaths: {}
    } as Config, undefined)).toBe(null)
  })

  it('returns subpath string if locale subpath is provided', () => {
    expect(subpathFromLng({
      localeSubpaths: {
        'en-GB': 'my-test-path'
      }
    } as unknown as Config, 'en-GB')).toBe('my-test-path')
  })
})
