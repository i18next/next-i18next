import {
  userConfig,
  userConfigClientSide,
  userConfigServerSide,
  setUpTest,
  tearDownTest,
  localeSubpathVariations,
} from './test-helpers'
import { Config } from '../../types'

import createConfig from '../../src/config/create-config'

const isServer: jest.Mock = require('../../src/utils/is-server')
jest.mock('../../src/utils/is-server.ts', (): jest.Mock => jest.fn())

describe('create configuration in non-production environment', (): void => {
  let evalFunc
  let pwd

  beforeEach((): void => {
    ({ evalFunc, pwd } = setUpTest())
  })

  afterEach((): void => {
    tearDownTest(evalFunc, pwd)
  })

  it('throws if userConfig.localeSubpaths is a boolean', (): void => {
    expect((): Config => createConfig({ localeSubpaths: 'string' })).toThrow(
      'The localeSubpaths option has been changed to an object. Please refer to documentation.',
    )
  })

  it('throws if defaultNS does not exist', (): void => {
    isServer.mockReturnValue(true)
    evalFunc.mockImplementation((): {} => ({
      readdirSync: jest.fn().mockImplementation((): string[] => ['universal', 'file1', 'file2']),
      existsSync: jest.fn().mockImplementation((): boolean => false),
    }))

    expect((): Config => createConfig({})).toThrow(
      'Default namespace not found at /home/user/public/locales/en/common.json',
    )
  })

  describe('server-side', (): void => {
    beforeEach((): void => {
      isServer.mockReturnValue(true)
    })

    it('creates default non-production configuration', (): void => {
      isServer.mockReturnValue(true)
      const config = createConfig({})

      expect(config.defaultLanguage).toEqual('en')
      expect(config.otherLanguages).toEqual([])
      expect(config.fallbackLng).toEqual(false)
      expect(config.load).toEqual('currentOnly')
      expect(config.localePath).toEqual('public/locales')
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

      expect(config.backend.loadPath).toEqual('/home/user/public/locales/{{lng}}/{{ns}}.json')
      expect(config.backend.addPath).toEqual('/home/user/public/locales/{{lng}}/{{ns}}.missing.json')
    })

    it('creates custom non-production configuration', (): void => {
      evalFunc.mockImplementation((): {} => ({
        readdirSync: jest.fn().mockImplementation((): string[] => ['universal', 'file1', 'file2']),
        existsSync: jest.fn().mockImplementation((): boolean => true),
      }))

      const config = createConfig(userConfigServerSide)

      expect(config.defaultLanguage).toEqual('de')
      expect(config.otherLanguages).toEqual(['fr', 'it'])
      expect(config.fallbackLng).toEqual('it')
      expect(config.load).toEqual('currentOnly')
      expect(config.localePath).toEqual('public/translations')
      expect(config.localeStructure).toEqual('{{ns}}/{{lng}}')
      expect(config.localeSubpaths).toEqual(localeSubpathVariations.FOREIGN)
      expect(config.defaultNS).toEqual('universal')
      expect(config.browserLanguageDetection).toEqual(false)
      expect(config.preload).toEqual(['fr', 'it', 'de'])

      expect(config.ns).toEqual(['universal', 'file1', 'file2'])

      expect(config.backend.loadPath).toEqual('/home/user/public/translations/{{ns}}/{{lng}}.json')
      expect(config.backend.addPath).toEqual('/home/user/public/translations/{{ns}}/{{lng}}.missing.json')
    })

    it('falls back to deprecated static folder', (): void => {
      isServer.mockReturnValue(true)
      evalFunc.mockImplementation((): {} => ({
        readdirSync: jest.fn().mockImplementation((): string[] => ['universal', 'file1', 'file2']),
        existsSync: jest.fn().mockImplementationOnce((): boolean => false).mockImplementationOnce((): boolean => true),
      }))
      const config = createConfig({ localePath: 'bogus/path' })

      expect(config.backend.loadPath).toEqual('/home/user/static/locales/{{lng}}/{{ns}}.json')
      expect(config.backend.addPath).toEqual('/home/user/static/locales/{{lng}}/{{ns}}.missing.json')
      expect(config.ns).toEqual(['universal', 'file1', 'file2'])
    })

    it('preserves config.ns, if provided in user configuration', (): void => {
      const mockReadDirSync = jest.fn()
      evalFunc.mockImplementation((): {} => ({
        readdirSync: mockReadDirSync,
        existsSync: jest.fn().mockImplementation((): boolean => true),
      }))
      const config = createConfig({ ns: ['common', 'ns1', 'ns2'] })

      expect(mockReadDirSync).not.toBeCalled()
      expect(config.ns).toEqual(['common', 'ns1', 'ns2'])
    })

    describe('localeExtension config option', (): void => {
      it('is set to JSON by default', (): void => {
        const config = createConfig(userConfig)
        expect(config.backend.loadPath).toEqual('/home/user/public/translations/{{ns}}/{{lng}}.json')
        expect(config.backend.addPath).toEqual('/home/user/public/translations/{{ns}}/{{lng}}.missing.json')
      })
      it('accepts any string and modifies backend paths', (): void => {
        const config = createConfig({
          ...userConfig,
          localeExtension: 'test-extension',
        })
        expect(config.backend.loadPath).toEqual('/home/user/public/translations/{{ns}}/{{lng}}.test-extension')
        expect(config.backend.addPath).toEqual('/home/user/public/translations/{{ns}}/{{lng}}.missing.test-extension')
      })
    })
  })

  const runClientSideTests = (): void => {
    it('creates default non-production configuration if process.browser === true', (): void => {
      isServer.mockReturnValue(false)
      const config = createConfig({})

      expect(config.defaultLanguage).toEqual('en')
      expect(config.otherLanguages).toEqual([])
      expect(config.fallbackLng).toEqual(false)
      expect(config.load).toEqual('currentOnly')
      expect(config.localePath).toEqual('public/locales')
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

      expect(config.backend.loadPath).toEqual('/locales/{{lng}}/{{ns}}.json')
      expect(config.backend.addPath).toEqual('/locales/{{lng}}/{{ns}}.missing.json')
    })

    it('creates custom client-side non-production configuration', (): void => {
      const config = createConfig(userConfigClientSide)

      expect(config.defaultLanguage).toEqual('de')
      expect(config.otherLanguages).toEqual(['fr', 'it'])
      expect(config.fallbackLng).toEqual('it')
      expect(config.load).toEqual('currentOnly')
      expect(config.localePath).toEqual('public/translations')
      expect(config.localeStructure).toEqual('{{ns}}/{{lng}}')
      expect(config.localeSubpaths).toEqual(localeSubpathVariations.FOREIGN)
      expect(config.defaultNS).toEqual('universal')
      expect(config.browserLanguageDetection).toEqual(false)

      expect(config.ns).toEqual(['universal'])

      expect(config.backend.loadPath).toEqual('/translations/{{ns}}/{{lng}}.json')
      expect(config.backend.addPath).toEqual('/translations/{{ns}}/{{lng}}.missing.json')
    })

    describe('localeExtension config option', (): void => {
      it('is set to JSON by default', (): void => {
        const config = createConfig(userConfig)
        expect(config.backend.loadPath).toEqual('/translations/{{ns}}/{{lng}}.json')
        expect(config.backend.addPath).toEqual('/translations/{{ns}}/{{lng}}.missing.json')
      })
      it('accepts any string and modifies backend paths', (): void => {
        const config = createConfig({
          ...userConfig,
          localeExtension: 'test-extension',
        })
        expect(config.backend.loadPath).toEqual('/translations/{{ns}}/{{lng}}.test-extension')
        expect(config.backend.addPath).toEqual('/translations/{{ns}}/{{lng}}.missing.test-extension')
      })
    })
  }

  // there are two definitions of being client side
  // 1. isNode is falsy; or
  // 2. isNode is truthy and typeof window !== 'undefined'
  describe('client-side', (): void => {
    beforeEach((): void => {
      isServer.mockReturnValue(false)
    })

    runClientSideTests()
  })

  describe('https://github.com/isaachinman/next-i18next/issues/134', (): void => {
    describe('if user specifies a default language and not a fallbackLng', (): void => {
      let userConfigDeNoFallback

      beforeEach((): void => {
        userConfigDeNoFallback = { ...userConfigClientSide, defaultLanguage: 'de' }
        delete userConfigDeNoFallback.fallbackLng
      })

      it('fallbackLng === false in development', (): void => {
        isServer.mockReturnValue(true)

        const config = createConfig(userConfigDeNoFallback)

        expect(config.fallbackLng).toEqual(false)
      })

      it('fallbackLng === user-specified default language in production', (): void => {
        process.env.NODE_ENV = 'production'
        isServer.mockReturnValue(true)

        const config = createConfig(userConfigDeNoFallback)

        expect(config.fallbackLng).toEqual('de')

        delete process.env.NODE_ENV
      })
    })
  })
})
