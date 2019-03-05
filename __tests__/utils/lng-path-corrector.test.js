/* eslint-env jest */

import { format } from 'url'

import lngPathCorrector from '../../src/utils/lng-path-corrector'
import { localeSubpathOptions } from '../../src/config/default-config'

describe('lngPathCorrector utility function', () => {
  let config
  let currentRoute

  beforeEach(() => {
    config = {
      defaultLanguage: 'en',
      allLanguages: ['en', 'de'],
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

  it('strips off the default language from as and leaves query empty', () => {
    const runTests = () => {
      const result = lngPathCorrector(config, currentRoute, 'en')
      expect(result.as).toEqual('/foo')
      expect(result.href)
        .toEqual(expect.objectContaining({ pathname: '/en/foo', query: {} }))
      expect(format(result.href)).toEqual('/en/foo')
    }

    currentRoute.href = '/en/foo'
    runTests()

    currentRoute.href = {
      pathname: '/en/foo',
      query: {},
    }
    runTests()
  })

  it('corrects path with language, if not the default', () => {
    const runTests = () => {
      const result = lngPathCorrector(config, currentRoute, 'de')
      expect(result.as).toEqual('/de/foo')
      expect(result.href)
        .toEqual(expect.objectContaining({ pathname: '/foo', query: { lng: 'de' } }))
      expect(format(result.href)).toEqual('/foo?lng=de')
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
      const result = lngPathCorrector(config, currentRoute, 'de')
      expect(result.as).toEqual('/de/foo?option1=value1')
      expect(result.href).toEqual(expect.objectContaining(
        { pathname: '/foo', query: { lng: 'de', option1: 'value1' } },
      ))
      expect(format(result.href)).toEqual('/foo?option1=value1&lng=de')
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
      const result = lngPathCorrector(config, currentRoute, 'de')
      expect(result.as).toEqual('/de/foo#hash1')
      expect(result.href).toEqual(expect.objectContaining(
        { pathname: '/foo', hash: '#hash1', query: { lng: 'de' } },
      ))
      expect(format(result.href)).toEqual('/foo?lng=de#hash1')
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
    // any changes to href.query will be overridden by href.search, so ensure
    // that href.search is removed to ensure that url.format() uses href.query
    currentRoute.href = {
      pathname: '/foo',
      search: '?option1=value1',
      query: { option1: 'value1' },
    }

    const result = lngPathCorrector(config, currentRoute, 'de')
    expect(Object.keys(result.href)).not.toContain('search')
    expect(result.href).toEqual(expect.objectContaining(
      { query: { option1: 'value1', lng: 'de' } },
    ))
    expect(format(result.href)).toEqual('/foo?option1=value1&lng=de')
  })

  it('makes a deep copy of href.query, if it exists', () => {
    currentRoute.href = {
      pathname: '/foo',
      query: { option1: 'value1' },
    }

    const result = lngPathCorrector(config, currentRoute, 'de')

    expect(currentRoute.href).toEqual(expect.objectContaining(
      { query: { option1: 'value1' } },
    ))
    expect(result.href).toEqual(expect.objectContaining(
      { query: { option1: 'value1', lng: 'de' } },
    ))
  })

  it('adds a query to the href object, if it does not exist', () => {
    currentRoute.href = {
      pathname: '/foo',
    }

    const result = lngPathCorrector(config, currentRoute, 'de')
    expect(result.href).toEqual(expect.objectContaining(
      { query: { lng: 'de' } },
    ))
  })

  describe('using as', () => {
    it('removes default language from as', () => {
      currentRoute.as = '/en/foo'
      currentRoute.href = '/somewhere/else?option1=value1#hash1'

      const result = lngPathCorrector(config, currentRoute, 'en')
      expect(result.as).toEqual('/foo')
      expect(result.href).toEqual(expect.objectContaining({
        pathname: '/somewhere/else',
        hash: '#hash1',
        query: { option1: 'value1' },
      }))
      expect(format(result.href)).toEqual('/somewhere/else?option1=value1#hash1')
    })

    it(`does not remove default language from as when localeSubpath is "${localeSubpathOptions.ALL}"`, () => {
      currentRoute.as = '/en/foo'
      currentRoute.href = '/somewhere/else?option1=value1#hash1'
      config.localeSubpaths = localeSubpathOptions.ALL

      const result = lngPathCorrector(config, currentRoute, 'en')
      expect(result.as).toEqual('/en/foo')
      expect(result.href).toEqual(expect.objectContaining({
        pathname: '/somewhere/else',
        hash: '#hash1',
        query: { option1: 'value1', lng: 'en' },
      }))
      expect(format(result.href)).toEqual('/somewhere/else?option1=value1&lng=en#hash1')
    })

    it('adds non-default language to as and href.query', () => {
      currentRoute.as = '/foo'
      currentRoute.href = '/somewhere/else?option1=value1#hash1'

      const result = lngPathCorrector(config, currentRoute, 'de')
      expect(result.as).toEqual('/de/foo')
      expect(result.href).toEqual(expect.objectContaining({
        pathname: '/somewhere/else',
        hash: '#hash1',
        query: { lng: 'de', option1: 'value1' },
      }))
      expect(format(result.href)).toEqual('/somewhere/else?option1=value1&lng=de#hash1')
    })
  })
})
