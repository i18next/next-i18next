/* eslint-env jest */
import NextRouter from 'next/router'
import wrapRouter from '../../src/router/wrap-router'
import { localeSubpathOptions } from '../../src/config/default-config'

jest.mock('next/router', () => ({
  asPath: '/some-path',
  back: jest.fn(),
  beforePopState: jest.fn(),
  components: { '_/app': {} },
  events: { on: jest.fn() },
  pathname: '/current-path',
  prefetch: jest.fn(),
  push: jest.fn(),
  query: { hello: 'world' },
  ready: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn(),
}))

const href = '/test'
const as = '/some-url'
const hrefObj = {
  pathname: href,
  query: { test: 'something' },
}
const options = { shallow: true }
const nextI18NextInternals = {
  i18n: {
    // Use non default language to ensure navigation calls
    // without localeSubpaths does not modify the paths
    languages: ['de', 'en'],
  },
  config: {
    defaultLanguage: 'en',
    localeSubpaths: localeSubpathOptions.NONE,
    allLanguages: ['en', 'de'],
  },
}

let router

describe('wrapRouter', () => {
  describe('NextRouter Instance', () => {
    beforeAll(() => {
      router = wrapRouter(nextI18NextInternals)
    })

    it('has the same properties as NextRouter', () => {
      expect(router).toHaveProperty('asPath')
      expect(router).toHaveProperty('back')
      expect(router).toHaveProperty('beforePopState')
      expect(router).toHaveProperty('components')
      expect(router).toHaveProperty('events')
      expect(router).toHaveProperty('pathname')
      expect(router).toHaveProperty('prefetch')
      expect(router).toHaveProperty('push')
      expect(router).toHaveProperty('query')
      expect(router).toHaveProperty('ready')
      expect(router).toHaveProperty('reload')
      expect(router).toHaveProperty('replace')
    })

    it('does not allow modification of NextRouter properties', () => {
      expect(() => { router.pathname = '/modified' }).toThrow()
      expect(() => { router.asPath = '/modified' }).toThrow()
      expect(() => { router.query = { hello: 'modified' } }).toThrow()
      expect(NextRouter.pathname).toEqual('/current-path')
      expect(NextRouter.asPath).toEqual('/some-path')
      expect(NextRouter.query).toEqual({ hello: 'world' })
    })

    it('calls the unmodified functions of NextRouter', () => {
      router.reload()
      expect(NextRouter.reload).toHaveBeenCalled()
      router.back()
      expect(NextRouter.back).toHaveBeenCalled()
      router.beforePopState()
      expect(NextRouter.beforePopState).toHaveBeenCalled()
      router.ready()
      expect(NextRouter.ready).toHaveBeenCalled()
      router.prefetch()
      expect(NextRouter.prefetch).toHaveBeenCalled()
    })
  })

  describe('without locale subpaths', () => {

    beforeAll(() => {
      NextRouter.push.mockClear()
      NextRouter.replace.mockClear()
      NextRouter.prefetch.mockClear()
      router = wrapRouter(nextI18NextInternals)
    })

    it('calls NextRouter.push', () => {
      router.push(href, as, options)
      router.push(hrefObj, as, options)
      expect(NextRouter.push).toHaveBeenNthCalledWith(1, '/test', as, options)
      expect(NextRouter.push).toHaveBeenNthCalledWith(2, hrefObj, as, options)
    })

    it('calls NextRouter.replace', () => {
      router.replace(href, as, options)
      router.replace(hrefObj, as, options)
      expect(NextRouter.replace).toHaveBeenNthCalledWith(1, '/test', as, options)
      expect(NextRouter.replace).toHaveBeenNthCalledWith(2, hrefObj, as, options)
    })
  })

  describe('wrapRouter locale subpaths', () => {
    beforeAll(() => {
      NextRouter.push.mockClear()
      NextRouter.replace.mockClear()
      NextRouter.prefetch.mockClear()
      nextI18NextInternals.config.localeSubpaths = localeSubpathOptions.FOREIGN
      router = wrapRouter(nextI18NextInternals)
    })

    it('calls NextRouter.push with locale subpath prepended', () => {
      router.push(href, as, options)
      expect(NextRouter.push).toHaveBeenNthCalledWith(1, expect.objectContaining({
        pathname: href,
        query: { lng: 'de' },
      }), `/de${as}`, options)

      router.push(hrefObj, as, options)
      expect(NextRouter.push).toHaveBeenNthCalledWith(2, {
        pathname: href,
        query: { test: 'something', lng: 'de' },
      }, `/de${as}`, options)

      router.push(href, undefined, options)
      expect(NextRouter.push).toHaveBeenNthCalledWith(3, expect.objectContaining({
        pathname: href,
        query: { lng: 'de' },
      }), `/de${href}`, options)

      router.push(hrefObj, undefined, options)
      expect(NextRouter.push).toHaveBeenNthCalledWith(4, {
        pathname: href,
        query: { test: 'something', lng: 'de' },
      }, `/de${href}?test=something`, options)
    })

    it('calls NextRouter.replace with locale subpath prepended', () => {
      router.replace(href, as, options)
      expect(NextRouter.replace).toHaveBeenNthCalledWith(1, expect.objectContaining({
        pathname: href,
        query: { lng: 'de' },
      }), `/de${as}`, options)

      router.replace(hrefObj, as, options)
      expect(NextRouter.replace).toHaveBeenNthCalledWith(2, {
        pathname: href,
        query: { test: 'something', lng: 'de' },
      }, `/de${as}`, options)

      router.replace(href, undefined, options)
      expect(NextRouter.replace).toHaveBeenNthCalledWith(3, expect.objectContaining({
        pathname: href,
        query: { lng: 'de' },
      }), `/de${href}`, options)

      router.replace(hrefObj, undefined, options)
      expect(NextRouter.replace).toHaveBeenNthCalledWith(4, {
        pathname: href,
        query: { test: 'something', lng: 'de' },
      }, `/de${href}?test=something`, options)
    })
  })
})
