/* eslint-env jest */

import handleLanguageSubpath from '../../src/utils/handle-language-subpath'

describe('handleLanguageSubpath utility function', () => {
  let req

  beforeEach(() => {
    req = {
      query: { option1: 'value1' },
      url: '/',
    }
  })

  it('modifies req object if this is a locale subpath', () => {
    req.url = '/de/path'

    handleLanguageSubpath(req, 'de')

    expect(req.url).toEqual('/path')
    expect(req.query).toEqual({
      lng: 'de',
      option1: 'value1',
    })
  })

  it('only removes the first instance of a locale from req.url', () => {
    req.url = '/de/path/de'

    handleLanguageSubpath(req, 'de')

    expect(req.url).toEqual('/path/de')
    expect(req.query).toEqual({
      lng: 'de',
      option1: 'value1',
    })
  })
})
