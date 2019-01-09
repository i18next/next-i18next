/* eslint-env jest */

import testConfig from '../test-config'

import handleLanguageSubpathMiddleware from '../../src/utils/handle-language-subpath'

describe('handleLanguageSubpath utility function', () => {
  const { allLanguages } = testConfig.options
  let handleLanguageSubpath
  let req
  let res
  let next

  beforeEach(() => {
    handleLanguageSubpath = handleLanguageSubpathMiddleware(allLanguages)

    req = {
      query: { option1: 'value1' },
      url: '/',
    }

    res = {}

    next = jest.fn()
  })

  it('skips everything if this is not a locale subpath', () => {
    req.url = '/path'

    handleLanguageSubpath(req, res, next)

    expect(req.url).toEqual('/path')
    expect(req.query).toEqual({ option1: 'value1' })

    expect(next).toBeCalled()
  })

  it('modifies req object if this is a locale subpath', () => {
    req.url = '/de/path'

    handleLanguageSubpath(req, res, next)

    expect(req.url).toEqual('/path')
    expect(req.query).toEqual({
      lng: 'de',
      option1: 'value1',
    })

    expect(next).toBeCalled()
  })
})
