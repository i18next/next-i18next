/* eslint-env jest */

import { setUpTest, tearDownTest } from './test-helpers'

import createConfig from '../../src/config/create-config'

jest.mock('detect-node', () => false)

describe('create configuration in non-production environment', () => {
  let evalFunc
  let pwd

  beforeEach(() => {
    ({ evalFunc, pwd } = setUpTest())
  })

  afterEach(() => {
    tearDownTest(evalFunc, pwd)
  })

  it('creates default non-node non-production configuration if !isNode', () => {
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
})
