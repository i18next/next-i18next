import {
  userConfig,
  userConfigClientSide,
  userConfigServerSide,
  setUpTest,
  tearDownTest,
  localeSubpathVariations,
} from './test-helpers'

import { createConfig } from '../../src/config/create-config'

const isServer: jest.Mock = require('../../src/utils/is-server').isServer
jest.mock('../../src/utils/is-server.ts', () => ({
  isServer: jest.fn()
}))

describe('create configuration in non-production environment', () => {
  let evalFunc
  let pwd

  beforeEach(() => {
    ({ evalFunc, pwd } = setUpTest())
  })

  afterEach(() => {
    tearDownTest(evalFunc, pwd)
  })

  it('throws if userConfig.localeSubpaths is a boolean', () => {
    expect(() => createConfig({ localeSubpaths: 'string' })).toThrow(
      'The localeSubpaths option has been changed to an object. Please refer to documentation.',
    )
  })

  it('throws if defaultNS does not exist', () => {
    isServer.mockReturnValue(true)
    evalFunc.mockImplementation(() => ({
      readdirSync: jest.fn().mockImplementation(() => ['universal', 'file1', 'file2']),
      existsSync: jest.fn().mockImplementation(() => false),
    }))

    expect(() => createConfig({})).toThrow(
      'Default namespace not found at /home/user/public/static/locales/en/common.json',
    )
  })

  it('Removes duplicate language keys', () => {
    let config = createConfig({ otherLanguages: ['de', 'fr', 'en', 'en'] })
    expect(config.allLanguages).toEqual(['de', 'fr', 'en'])
    config = createConfig({ otherLanguages: ['de', 'en'], defaultLanguage: 'en' })
    expect(config.allLanguages).toEqual(['de', 'en'])
  })

  describe('server-side', () => {
    beforeEach(() => {
      isServer.mockReturnValue(true)
    })

    it('creates default non-production configuration', () => {
      isServer.mockReturnValue(true)
      const config = createConfig({})

      expect(config.defaultLanguage).toEqual('en')
      expect(config.otherLanguages).toEqual([])
      expect(config.fallbackLng).toEqual(false)
      expect(config.load).toEqual('currentOnly')
      expect(config.localePath).toEqual('public/static/locales')
      expect(config.localeStructure).toEqual('{{lng}}/{{ns}}')
      expect(config.localeSubpaths).toEqual({})
      expect(config.use).toEqual([])
      expect(config.defaultNS).toEqual('common')

      expect(config.interpolation.escapeValue).toEqual(false)
      expect(config.interpolation.formatSeparator).toEqual(',')
      expect(config.interpolation.format('format me', 'uppercase')).toEqual('FORMAT ME')
      expect(config.interpolation.format('format me')).toEqual('format me')

      expect(config.browserLanguageDetection).toEqual(true)

      expect(config.detection.order).toEqual(['cookie', 'header', 'querystring'])
      expect(config.detection.caches).toEqual(['cookie'])

      expect(config.react.wait).toEqual(true)

      expect(config.initImmediate).toEqual(false)

      expect(config.preload).toEqual(['en'])

      expect(config.ns).toEqual(['common', 'file1', 'file2'])

      expect(config.backend.loadPath).toEqual('/home/user/public/static/locales/{{lng}}/{{ns}}.json')
      expect(config.backend.addPath).toEqual('/home/user/public/static/locales/{{lng}}/{{ns}}.missing.json')
    })

    it('creates custom non-production configuration', () => {
      evalFunc.mockImplementation(() => ({
        readdirSync: jest.fn().mockImplementation(() => ['universal', 'file1', 'file2']),
        existsSync: jest.fn().mockImplementation(() => true),
      }))

      const config = createConfig(userConfigServerSide)

      expect(config.defaultLanguage).toEqual('de')
      expect(config.otherLanguages).toEqual(['fr', 'it'])
      expect(config.fallbackLng).toEqual('it')
      expect(config.load).toEqual('currentOnly')
      expect(config.localePath).toEqual('public/static/translations')
      expect(config.localeStructure).toEqual('{{ns}}/{{lng}}')
      expect(config.localeSubpaths).toEqual(localeSubpathVariations.FOREIGN)
      expect(config.defaultNS).toEqual('universal')
      expect(config.browserLanguageDetection).toEqual(false)
      expect(config.preload).toEqual(['fr', 'it', 'de'])

      expect(config.ns).toEqual(['universal', 'file1', 'file2'])

      expect(config.backend.loadPath).toEqual('/home/user/public/static/translations/{{ns}}/{{lng}}.json')
      expect(config.backend.addPath).toEqual('/home/user/public/static/translations/{{ns}}/{{lng}}.missing.json')
    })

    it('falls back to deprecated static folder', () => {
      isServer.mockReturnValue(true)
      evalFunc.mockImplementation(() => ({
        readdirSync: jest.fn().mockImplementation(() => ['universal', 'file1', 'file2']),
        existsSync: jest.fn().mockImplementationOnce(() => false).mockImplementationOnce(() => true),
      }))
      const config = createConfig({ localePath: 'bogus/path' })

      expect(config.backend.loadPath).toEqual('/home/user/static/locales/{{lng}}/{{ns}}.json')
      expect(config.backend.addPath).toEqual('/home/user/static/locales/{{lng}}/{{ns}}.missing.json')
      expect(config.ns).toEqual(['universal', 'file1', 'file2'])
    })

    it('preserves config.ns, if provided in user configuration', () => {
      const mockReadDirSync = jest.fn()
      evalFunc.mockImplementation(() => ({
        readdirSync: mockReadDirSync,
        existsSync: jest.fn().mockImplementation(() => true),
      }))
      const config = createConfig({ ns: ['common', 'ns1', 'ns2'] })

      expect(mockReadDirSync).not.toBeCalled()
      expect(config.ns).toEqual(['common', 'ns1', 'ns2'])
    })

    describe('localeExtension config option', () => {
      it('is set to JSON by default', () => {
        const config = createConfig(userConfig)
        expect(config.backend.loadPath).toEqual('/home/user/public/static/translations/{{ns}}/{{lng}}.json')
        expect(config.backend.addPath).toEqual('/home/user/public/static/translations/{{ns}}/{{lng}}.missing.json')
      })
      it('accepts any string and modifies backend paths', () => {
        const config = createConfig({
          ...userConfig,
          localeExtension: 'test-extension',
        })
        expect(config.backend.loadPath).toEqual('/home/user/public/static/translations/{{ns}}/{{lng}}.test-extension')
        expect(config.backend.addPath).toEqual('/home/user/public/static/translations/{{ns}}/{{lng}}.missing.test-extension')
      })
    })
  })

  const runClientSideTests = () => {
    it('creates default non-production configuration if process.browser === true', () => {
      isServer.mockReturnValue(false)
      const config = createConfig({})

      expect(config.defaultLanguage).toEqual('en')
      expect(config.otherLanguages).toEqual([])
      expect(config.fallbackLng).toEqual(false)
      expect(config.load).toEqual('currentOnly')
      expect(config.localePath).toEqual('public/static/locales')
      expect(config.localeStructure).toEqual('{{lng}}/{{ns}}')
      expect(config.localeSubpaths).toEqual(localeSubpathVariations.NONE)
      expect(config.use).toEqual([])
      expect(config.defaultNS).toEqual('common')

      expect(config.interpolation.escapeValue).toEqual(false)
      expect(config.interpolation.formatSeparator).toEqual(',')
      expect(config.interpolation.format('format me', 'uppercase')).toEqual('FORMAT ME')
      expect(config.interpolation.format('format me')).toEqual('format me')

      expect(config.browserLanguageDetection).toEqual(true)

      expect(config.detection.order).toEqual(['cookie', 'header', 'querystring'])
      expect(config.detection.caches).toEqual(['cookie'])

      expect(config.react.wait).toEqual(true)

      expect(config.initImmediate).toEqual(true)

      expect(config.preload).toBeUndefined()

      expect(config.ns).toEqual(['common'])

      expect(config.backend.loadPath).toEqual('/static/locales/{{lng}}/{{ns}}.json')
      expect(config.backend.addPath).toEqual('/static/locales/{{lng}}/{{ns}}.missing.json')
    })

    it('creates custom client-side non-production configuration', () => {
      const config = createConfig(userConfigClientSide)

      expect(config.defaultLanguage).toEqual('de')
      expect(config.otherLanguages).toEqual(['fr', 'it'])
      expect(config.fallbackLng).toEqual('it')
      expect(config.load).toEqual('currentOnly')
      expect(config.localePath).toEqual('public/static/translations')
      expect(config.localeStructure).toEqual('{{ns}}/{{lng}}')
      expect(config.localeSubpaths).toEqual(localeSubpathVariations.FOREIGN)
      expect(config.defaultNS).toEqual('universal')
      expect(config.browserLanguageDetection).toEqual(false)

      expect(config.ns).toEqual(['universal'])

      expect(config.backend.loadPath).toEqual('/static/translations/{{ns}}/{{lng}}.json')
      expect(config.backend.addPath).toEqual('/static/translations/{{ns}}/{{lng}}.missing.json')
    })

    describe('localeExtension config option', () => {
      it('is set to JSON by default', () => {
        const config = createConfig(userConfig)
        expect(config.backend.loadPath).toEqual('/static/translations/{{ns}}/{{lng}}.json')
        expect(config.backend.addPath).toEqual('/static/translations/{{ns}}/{{lng}}.missing.json')
      })
      it('accepts any string and modifies backend paths', () => {
        const config = createConfig({
          ...userConfig,
          localeExtension: 'test-extension',
        })
        expect(config.backend.loadPath).toEqual('/static/translations/{{ns}}/{{lng}}.test-extension')
        expect(config.backend.addPath).toEqual('/static/translations/{{ns}}/{{lng}}.missing.test-extension')
      })
    })
  }

  // there are two definitions of being client side
  // 1. isNode is falsy; or
  // 2. isNode is truthy and typeof window !== 'undefined'
  describe('client-side', () => {
    beforeEach(() => {
      isServer.mockReturnValue(false)
    })

    runClientSideTests()
  })

  describe('https://github.com/isaachinman/next-i18next/issues/134', () => {
    describe('if user specifies a default language and not a fallbackLng', () => {
      let userConfigDeNoFallback

      beforeEach(() => {
        userConfigDeNoFallback = { ...userConfigClientSide, defaultLanguage: 'de' }
        delete userConfigDeNoFallback.fallbackLng
      })

      it('fallbackLng === false in development', () => {
        isServer.mockReturnValue(true)

        const config = createConfig(userConfigDeNoFallback)

        expect(config.fallbackLng).toEqual(false)
      })

      it('fallbackLng === user-specified default language in production', () => {
        process.env.NODE_ENV = 'production'
        isServer.mockReturnValue(true)

        const config = createConfig(userConfigDeNoFallback)

        expect(config.fallbackLng).toEqual('de')

        delete process.env.NODE_ENV
      })
    })
  })
})
