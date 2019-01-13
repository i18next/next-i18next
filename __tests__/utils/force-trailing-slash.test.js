/* eslint-env jest */

import { parse } from 'url'
import testConfig from '../test-config'

import forceTrailingSlash from '../../src/utils/force-trailing-slash'

jest.mock('url', () => ({
  parse: jest.fn(),
}))

describe('forceTrailingSlash utility function', () => {
  const { allLanguages } = testConfig.options
  let req
  let res

  const mockParse = (pathname, search = '') => {
    parse.mockImplementation(() => ({
      pathname,
      search,
    }))
  }

  beforeEach(() => {
    req = {
      url: '/',
    }

    res = {
      redirect: jest.fn(),
      header: jest.fn(),
    }
  })

  afterEach(() => {
    parse.mockReset()
  })

  it('does not redirect if pathname is not /en or /de', () => {
    mockParse('/')

    expect(forceTrailingSlash(allLanguages, req, res)).toEqual(false)

    expect(res.redirect).not.toBeCalled()
  })

  it('redirects if pathname is lang without trailing slash', () => {
    mockParse('/en')

    expect(forceTrailingSlash(allLanguages, req, res)).toEqual(true)

    expect(res.redirect).toBeCalledWith(302, '/en/')
  })

  it('redirects if pathname is lang without trailing slash (adds search params)', () => {
    mockParse('/de', '?option1=value1')

    expect(forceTrailingSlash(allLanguages, req, res)).toEqual(true)

    expect(res.redirect).toBeCalledWith(302, '/de/?option1=value1')
  })
})
