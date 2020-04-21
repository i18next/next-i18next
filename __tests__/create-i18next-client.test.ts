import i18next from 'i18next'
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector'
import createI18nextClient from '../src/create-i18next-client'

const i18nextMiddleware = require('i18next-http-middleware')

jest.mock('i18next', () => ({
  init: jest.fn(() => new Promise(resolve => setTimeout(() => resolve(), 0))),
  use: jest.fn(),
}))

jest.mock('i18next-http-middleware', () => ({
  LanguageDetector: jest.fn(),
}))

jest.mock('i18next-browser-languagedetector', () => jest.fn())

describe('initializing i18n', () => {
  beforeEach(() => {
    i18next.isInitialized = false
  })

  afterEach(() => {
    (i18next.init as jest.Mock).mockClear();
    (i18next.use as jest.Mock).mockClear()
    i18nextMiddleware.LanguageDetector.mockClear()
  })

  it('should return both the i18n object and an initPromise', async () => {
    const { i18n, initPromise } = createI18nextClient({
      use: [],
      customDetectors: [],
    })
    expect(typeof i18n.isInitialized).toBe('boolean')
    expect(typeof initPromise.then).toBe('function')
  })

  it('should not initialize i18n if i18n is already initialized', () => {
    i18next.isInitialized = true

    createI18nextClient({
      use: [],
      customDetectors: [],
      serverLanguageDetection: true,
      browserLanguageDetection: true,
    })

    expect(i18next.init).not.toBeCalled()
    expect(i18next.use).not.toBeCalled()
  })

  it('should initialize i18n if i18n is not yet initialized', () => {
    i18next.isInitialized = false

    createI18nextClient({
      use: [],
      customDetectors: [],
      serverLanguageDetection: true,
      browserLanguageDetection: true,
    })

    expect(i18next.use).toBeCalledTimes(2)
    expect(i18next.init).toBeCalledTimes(1)
  })

  it('should add backend language detector if on node environment', () => {
    i18next.isInitialized = false

    createI18nextClient({
      use: [],
      customDetectors: [],
      serverLanguageDetection: true,
    })

    expect(i18nextMiddleware.LanguageDetector).toBeCalled()
    expect(I18nextBrowserLanguageDetector).not.toBeCalled()
    expect(i18next.use).toBeCalledTimes(2)
    expect(i18next.init).toBeCalled()
  })

  it('should call addDetector with the right detector if serverLanguageDetection is true', () => {
    i18next.isInitialized = false
    const addDetector = jest.fn()
    i18nextMiddleware.LanguageDetector.mockImplementation(() => ({
      addDetector,
    }))

    createI18nextClient({
      use: [],
      customDetectors: ['test_custom_detector'],
      serverLanguageDetection: true,
    })
    expect(i18nextMiddleware.LanguageDetector).toBeCalled()
    expect(I18nextBrowserLanguageDetector).not.toBeCalled()
    expect(addDetector).toBeCalledWith('test_custom_detector')
    expect(i18next.use).toBeCalledTimes(2)
    expect(i18next.init).toBeCalledTimes(1)
  })

  it('should not call addDetector with the right detector if serverLanguageDetection is false', () => {
    i18next.isInitialized = false
    const addDetector = jest.fn()
    i18nextMiddleware.LanguageDetector.mockImplementation(() => ({
      addDetector,
    }))

    createI18nextClient({
      use: [],
      customDetectors: ['test_custom_detector'],
      serverLanguageDetection: false,
    })
    expect(i18nextMiddleware.LanguageDetector).not.toBeCalled()
    expect(I18nextBrowserLanguageDetector).not.toBeCalled()
    expect(addDetector).not.toBeCalled()
    expect(i18next.use).toBeCalledTimes(1)
    expect(i18next.init).toBeCalledTimes(1)
  })
})
