/* eslint-env jest */

import { parse } from 'url'

import forceTrailingSlash from '../../src/utils/force-trailing-slash'

jest.mock('url', () => ({
  parse: jest.fn(),
}))

describe('forceTrailingSlash utility function', () => {
  let req
  let res
  let next

  const mockParse = (pathname, search = '') => {
    parse.mockImplementation(() => ({
      pathname,
      search,
    }))
  }

  beforeEach(() => {
    req = {
      i18n: {
        options: { allLanguages: ['en', 'de'] },
      },
      url: '/',
    }

    res = {
      redirect: jest.fn(),
      header: jest.fn(),
    }

    next = jest.fn()
  })

  afterEach(() => {
    parse.mockReset()
  })

  it('does not redirect if pathname is not /en or /de', () => {
    mockParse('/')

    forceTrailingSlash(req, res, next)

    expect(res.redirect).not.toBeCalled()

    expect(next).toBeCalled()
  })

  it('redirects if pathname is lang without trailing slash', () => {
    mockParse('/en')

    forceTrailingSlash(req, res, next)

    expect(res.redirect).toBeCalledWith(302, '/en/')

    expect(next).not.toBeCalled()
  })

  it('redirects if pathname is lang without trailing slash (adds search params)', () => {
    mockParse('/de', '?option1=value1')

    forceTrailingSlash(req, res, next)

    expect(res.redirect).toBeCalledWith(302, '/de/?option1=value1')

    expect(next).not.toBeCalled()
  })
})
