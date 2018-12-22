/* eslint-env jest */

import { userConfig, setUpTest, tearDownTest } from './test-helpers'

import createConfig from '../../src/config/create-config'

jest.mock('detect-node', () => true)

describe('create configuration in non-production environment', () => {
  let evalFunc
  let pwd

  beforeEach(() => {
    ({ evalFunc, pwd } = setUpTest())
  })

  afterEach(() => {
    tearDownTest(evalFunc, pwd)
  })

  it('creates default server-side non-production configuration', () => {
    const config = createConfig({})

    expect(config.defaultLanguage).toEqual('en')
    expect(config.otherLanguages).toEqual([])
    expect(config.fallbackLng).toBeNull()
    expect(config.load).toEqual('languageOnly')
    expect(config.localePath).toEqual('static/locales')
    expect(config.localeStructure).toEqual('{{lng}}/{{ns}}')
    expect(config.localeSubpaths).toEqual(false)
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

    expect(config.preload).toEqual(['en'])

    expect(config.ns).toEqual(['common', 'file1', 'file2'])

    expect(config.backend.loadPath).toEqual('/home/user/static/locales/{{lng}}/{{ns}}.json')
    expect(config.backend.addPath).toEqual('/home/user/static/locales/{{lng}}/{{ns}}.missing.json')
  })

  it('creates custom server-side non-production configuration', () => {
    evalFunc.mockImplementation(() => ({
      readdirSync: jest.fn().mockImplementation(() => ['universal', 'file1', 'file2']),
    }))

    const config = createConfig(userConfig)

    expect(config.defaultLanguage).toEqual('de')
    expect(config.otherLanguages).toEqual(['fr', 'it'])
    expect(config.fallbackLng).toEqual('it')
    expect(config.load).toEqual('languageOnly')
    expect(config.localePath).toEqual('static/translations')
    expect(config.localeStructure).toEqual('{{ns}}/{{lng}}')
    expect(config.localeSubpaths).toEqual(true)
    expect(config.defaultNS).toEqual('universal')
    expect(config.browserLanguageDetection).toEqual(false)
    expect(config.preload).toEqual(['fr', 'it', 'de'])

    expect(config.ns).toEqual(['universal', 'file1', 'file2'])

    expect(config.backend.loadPath).toEqual('/home/user/static/translations/{{ns}}/{{lng}}.json')
    expect(config.backend.addPath).toEqual('/home/user/static/translations/{{ns}}/{{lng}}.missing.json')
  })

  it('creates default client-side non-production configuration if process.browser === true', () => {
    process.browser = true
    const config = createConfig({})

    expect(config.defaultLanguage).toEqual('en')
    expect(config.otherLanguages).toEqual([])
    expect(config.fallbackLng).toBeNull()
    expect(config.load).toEqual('languageOnly')
    expect(config.localePath).toEqual('static/locales')
    expect(config.localeStructure).toEqual('{{lng}}/{{ns}}')
    expect(config.localeSubpaths).toEqual(false)
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

    expect(config.preload).toBeUndefined()

    expect(config.ns).toEqual(['common'])

    expect(config.backend.loadPath).toEqual('/static/locales/{{lng}}/{{ns}}.json')
    expect(config.backend.addPath).toEqual('/static/locales/{{lng}}/{{ns}}.missing.json')
  })

  it('creates custom client-side non-production configuration', () => {
    process.browser = true
    const config = createConfig(userConfig)

    expect(config.defaultLanguage).toEqual('de')
    expect(config.otherLanguages).toEqual(['fr', 'it'])
    expect(config.fallbackLng).toEqual('it')
    expect(config.load).toEqual('languageOnly')
    expect(config.localePath).toEqual('static/translations')
    expect(config.localeStructure).toEqual('{{ns}}/{{lng}}')
    expect(config.localeSubpaths).toEqual(true)
    expect(config.defaultNS).toEqual('universal')
    expect(config.browserLanguageDetection).toEqual(false)

    expect(config.ns).toEqual(['universal'])

    expect(config.backend.loadPath).toEqual('/static/locales/{{lng}}/{{ns}}.json')
    expect(config.backend.addPath).toEqual('/static/locales/{{lng}}/{{ns}}.missing.json')
  })

})
