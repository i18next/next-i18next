/* eslint-env jest */

describe('default configuration', () => {
  it('default production configuration', () => {
    process.env.NODE_ENV = 'production'

    const config = require('../../src/config/default-config.js')

    expect(config.defaultLanguage).toEqual('en')
    expect(config.otherLanguages).toEqual([])
    expect(config.fallbackLng).toEqual('en')
    expect(config.load).toEqual('languageOnly')
    expect(config.localePath).toEqual('static/locales')
    expect(config.localeStructure).toEqual('{{lng}}/{{ns}}')
    expect(config.localeSubpaths).toEqual(false)
    expect(config.ns).toEqual(['common'])
    expect(config.use).toEqual([])
    expect(config.defaultNS).toEqual('common')

    expect(config.interpolation.escapeValue).toEqual(false)
    expect(config.interpolation.formatSeparator).toEqual(',')
    expect(config.interpolation.format('format me', 'uppercase')).toEqual('FORMAT ME')
    expect(config.interpolation.format('format me')).toEqual('format me')

    expect(config.browserLanguageDetection).toEqual(true)

    expect(config.detection.order).toEqual(['cookie', 'header', 'querystring'])
    expect(config.detection.caches).toEqual(['cookie'])

    expect(config.backend.loadPath).toEqual('/static/locales/{{lng}}/{{ns}}.json')
    expect(config.backend.addPath).toEqual('/static/locales/{{lng}}/{{ns}}.missing.json')

    expect(config.react.wait).toEqual(true)

    delete require.cache[require.resolve('../../src/config/default-config.js')]
  })
})
