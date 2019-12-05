import { format } from 'url'

import { lngPathCorrector } from '../../src/utils/lng-path-corrector'
import { localeSubpathVariations } from '../config/test-helpers'

describe('lngPathCorrector utility function', () => {
  let config
  let currentRoute

  beforeEach(() => {
    config = {
      defaultLanguage: 'en',
      allLanguages: ['en', 'de'],
      localeSubpaths: localeSubpathVariations.NONE,
    }

    currentRoute = {
      href: '/',
    }
  })

  it('throws if allLanguages does not include current language', () => {
    config.allLanguages = ['de', 'fr']

    expect(() => lngPathCorrector(config, currentRoute, 'en'))
      .toThrowError('Invalid configuration: Current language is not included in all languages array')
  })

  it('throws if currentRoute.href is not a string or object', () => {
    expect(() => lngPathCorrector(config, { href: undefined }, 'en')).toThrowError(
      '\'href\' type must be either \'string\' or \'object\', but it is undefined',
    )
  })

  it('throws if currentRoute.as is not undefined or a string', () => {
    currentRoute.as = 10
    expect(() => lngPathCorrector(config, currentRoute, 'en')).toThrowError(
      '\'as\' type must be \'string\', but it is number',
    )
  })

  it('corrects path with language, if not the default', () => {
    const runTests = () => {
      config.localeSubpaths = localeSubpathVariations.FOREIGN
      const result = lngPathCorrector(config, currentRoute, 'de')
      expect(result.as).toEqual('/german/foo')
      expect(result.href)
        .toEqual(expect.objectContaining({
          pathname: '/foo',
          query: {
            lng: 'de',
            subpath: 'german',
          }
        }))
      expect(format(result.href)).toEqual('/foo?lng=de&subpath=german')
    }

    currentRoute.href = '/foo'
    runTests()

    currentRoute.href = {
      pathname: '/foo',
      query: {},
    }
    runTests()
  })

  it('adds to query parameters, if some already exist', () => {
    const runTests = () => {
      config.localeSubpaths = localeSubpathVariations.ALL
      const result = lngPathCorrector(config, currentRoute, 'de')
      expect(result.as).toEqual('/german/foo?option1=value1')
      expect(result.href).toEqual(expect.objectContaining({
        pathname: '/foo',
        query: {
          lng: 'de',
          subpath: 'german',
          option1: 'value1',
        }
      }))
      expect(format(result.href)).toEqual('/foo?option1=value1&lng=de&subpath=german')
    }

    currentRoute.href = '/foo?option1=value1'
    runTests()

    currentRoute.href = {
      pathname: '/foo',
      query: { option1: 'value1' },
    }
    runTests()
  })

  it('preserves hash, if it exists', () => {
    const runTests = () => {
      config.localeSubpaths = localeSubpathVariations.ALL
      const result = lngPathCorrector(config, currentRoute, 'de')
      expect(result.as).toEqual('/german/foo#hash1')
      expect(result.href).toEqual(expect.objectContaining({
        pathname: '/foo',
        hash: '#hash1',
        query: {
          lng: 'de',
          subpath: 'german',
        }
      },
      ))
      expect(format(result.href)).toEqual('/foo?lng=de&subpath=german#hash1')
    }

    currentRoute.href = '/foo#hash1'
    runTests()

    currentRoute.href = {
      pathname: '/foo',
      query: {},
      hash: '#hash1',
    }
    runTests()
  })

  it('removes href.search, if present, in favor of href.query', () => {
    config.localeSubpaths = localeSubpathVariations.ALL

    // any changes to href.query will be overridden by href.search, so ensure
    // that href.search is removed to ensure that url.format() uses href.query
    currentRoute.href = {
      pathname: '/foo',
      search: '?option1=value1',
      query: { option1: 'value1' },
    }

    const result = lngPathCorrector(config, currentRoute, 'de')
    expect(Object.keys(result.href)).not.toContain('search')
    expect(result.href).toEqual(expect.objectContaining({
      query: {
        option1: 'value1',
        lng: 'de',
        subpath: 'german',
      }
    }))
    expect(format(result.href)).toEqual('/foo?option1=value1&lng=de&subpath=german')
  })

  it('makes a deep copy of href.query, if it exists', () => {
    config.localeSubpaths = localeSubpathVariations.ALL
    currentRoute.href = {
      pathname: '/foo',
      query: {
        option1: 'value1'
      },
    }

    const result = lngPathCorrector(config, currentRoute, 'de')

    expect(currentRoute.href).toEqual(expect.objectContaining({
      query: {
        option1: 'value1',
      }
    }))
    expect(result.href).toEqual(expect.objectContaining({
      query: {
        option1: 'value1',
        lng: 'de',
        subpath: 'german',
      }
    }))
  })

  it('adds a query to the href object, if it does not exist', () => {
    config.localeSubpaths = localeSubpathVariations.ALL
    currentRoute.href = {
      pathname: '/foo',
    }

    const result = lngPathCorrector(config, currentRoute, 'de')
    expect(result.href).toEqual(expect.objectContaining({
      query: {
        lng: 'de',
        subpath: 'german',
      },
    }))
  })

  describe('using as', () => {
    it('does not remove default language from as when localeSubpath is provided', () => {
      currentRoute.as = '/english/foo'
      currentRoute.href = '/somewhere/else?option1=value1#hash1'
      config.localeSubpaths = localeSubpathVariations.ALL

      const result = lngPathCorrector(config, currentRoute, 'en')
      expect(result.as).toEqual('/english/foo')
      expect(result.href).toEqual(expect.objectContaining({
        pathname: '/somewhere/else',
        hash: '#hash1',
        query: {
          option1: 'value1',
          lng: 'en',
          subpath: 'english',
        },
      }))
      expect(format(result.href)).toEqual('/somewhere/else?option1=value1&lng=en&subpath=english#hash1')
    })

    it('adds non-default language to as and href.query', () => {
      currentRoute.as = '/foo'
      currentRoute.href = '/somewhere/else?option1=value1#hash1'
      config.localeSubpaths = localeSubpathVariations.ALL

      const result = lngPathCorrector(config, currentRoute, 'de')
      expect(result.as).toEqual('/german/foo')
      expect(result.href).toEqual(expect.objectContaining({
        pathname: '/somewhere/else',
        hash: '#hash1',
        query: {
          lng: 'de',
          subpath: 'german',
          option1: 'value1',
        },
      }))
      expect(format(result.href)).toEqual('/somewhere/else?option1=value1&lng=de&subpath=german#hash1')
    })
  })
})
