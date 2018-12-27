/* eslint-env jest */

import i18nextMiddleware from 'i18next-express-middleware'
import { parse } from 'url'

import nextI18nextMiddleware from '../../src/middlewares/next-i18next-middleware'

jest.mock('i18next-express-middleware', () => ({
  handle: jest.fn(),
}))

jest.mock('utils', () => ({
  forceTrailingSlash: 'forceTrailingSlash',
  lngPathDetector: 'lngPathDetector',
}))

jest.mock('url', () => ({
  parse: jest.fn(),
}))

describe('next-18next middleware', () => {
  let app
  let nexti18next
  let server

  beforeEach(() => {
    app = {
      render: jest.fn(),
    }

    nexti18next = {
      config: {
        allLanguages: ['en', 'de'],
        ignoreRoutes: ['/_next', '/static'],
        localeSubpaths: true,
      },
      i18n: 'i18n',
    }

    server = {
      get: jest.fn(),
      use: jest.fn(),
    }
  })

  it('uses i18nextMiddleware without localeSubpaths', () => {
    nexti18next.config.localeSubpaths = false

    nextI18nextMiddleware(nexti18next, app, server)

    expect(server.use).toBeCalled()
    expect(i18nextMiddleware.handle)
      .toBeCalledWith('i18n',
        expect.objectContaining({
          ignoreRoutes: expect.arrayContaining(['/_next', '/static']),
        }))

    expect(server.get).not.toBeCalled()
  })

  it('uses i18nextMiddleware with localeSubpaths', () => {
    nextI18nextMiddleware(nexti18next, app, server)

    expect(server.use).toBeCalled()
    expect(i18nextMiddleware.handle)
      .toBeCalledWith('i18n',
        expect.objectContaining({
          ignoreRoutes: expect.arrayContaining(['/_next', '/static']),
        }))

    expect(server.get).toBeCalledTimes(3)
    expect(server.get).toBeCalledWith(/^\/(?!_next|static).*$/, 'forceTrailingSlash')
    expect(server.get).toBeCalledWith(/^\/(?!_next|static).*$/, 'lngPathDetector')

    expect(server.get.mock.calls[2][0]).toEqual('/:lng(en|de)/*')

    const appRenderFunction = server.get.mock.calls[2][1]
    const req = {
      params: {
        lng: 'en',
      },
    }
    const res = {}

    parse.mockImplementation(() => ({
      pathname: '/en/foo',
    }))

    appRenderFunction(req, res)

    expect(app.render).toBeCalledWith(req, res, '/foo', { lng: 'en' })

    app.render.mockClear()

    // with query parameters
    req.query = {
      option1: 'value1',
    }

    appRenderFunction(req, res)

    expect(app.render).toBeCalledWith(req, res, '/foo', { option1: 'value1', lng: 'en' })
  })
})
