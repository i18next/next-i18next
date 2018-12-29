/* eslint-env jest */

import lngPathDetector from '../../src/utils/lng-path-detector'

describe('lngPathDetector utility function', () => {
  let req
  let res
  let next

  beforeEach(() => {
    req = {
      i18n: {
        changeLanguage: jest.fn(),
        languages: ['en', 'de'],
        options: {
          allLanguages: ['en', 'de'],
          defaultLanguage: 'en',
        },
      },
      url: '/',
    }

    res = {
      redirect: jest.fn(),
    }

    next = jest.fn()
  })

  it('skips everything if req.i18n is not defined', () => {
    delete req.i18n

    lngPathDetector(req, res, next)

    expect(res.redirect).not.toBeCalled()

    expect(next).toBeCalled()
  })

  it('changes language if url starts with langauge and is not languages[0]', () => {
    req.url = '/de/foo'

    lngPathDetector(req, res, next)

    expect(req.i18n.changeLanguage).toBeCalledWith('de')

    expect(res.redirect).not.toBeCalled()

    expect(next).toBeCalled()
  })

  it('performs redirect if url starts with default and language is not the default', () => {
    req.i18n.languages = ['de', 'en']
    req.url = '/en/foo?test=123'

    lngPathDetector(req, res, next)

    expect(req.i18n.changeLanguage).toBeCalledWith('en')

    expect(res.redirect).toBeCalledWith(301, '/de/foo?test=123')

    expect(next).toBeCalled()
  })

  it('strips language off url and redirects if langauge is languages[0]', () => {
    req.url = '/en/foo'

    lngPathDetector(req, res, next)

    expect(req.i18n.changeLanguage).not.toBeCalledWith()

    expect(res.redirect).toBeCalledWith(301, '/foo')

    expect(next).toBeCalled()
  })
})
