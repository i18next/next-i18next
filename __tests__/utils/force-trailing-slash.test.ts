import forceTrailingSlash from '../../src/utils/force-trailing-slash'

const parse: jest.Mocked<any> = require('url').parse

jest.mock('url', () => ({
  parse: jest.fn(),
}))

describe('forceTrailingSlash utility function', () => {
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

  it('redirects from /en to /en/', () => {
    mockParse('/en')

    forceTrailingSlash(req, res, 'en')

    expect(res.redirect).toBeCalledWith(302, '/en/')
  })

  it('redirects from /de to /de/ (adds search params)', () => {
    mockParse('/de', '?option1=value1')

    forceTrailingSlash(req, res, 'de')

    expect(res.redirect).toBeCalledWith(302, '/de/?option1=value1')
  })
})
