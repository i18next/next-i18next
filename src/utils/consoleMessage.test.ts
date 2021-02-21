import { consoleMessage } from '../../src/utils'
import { InternalConfig } from '../../types'

const consoleMessageStrictMode = (type, message) =>
  consoleMessage(type, message, {
    strictMode: true,
    errorStackTraceLimit: 0,
  } as InternalConfig)

const consoleMessageNotStrictMode = (type, message) =>
  consoleMessage(type, message, {
    strictMode: false,
  } as InternalConfig)

describe('consoleMessage utility function', () => {
  const OLD_ENV = process.env

  let consoleInfoSpy
  let consoleWarnSpy
  let consoleErrSpy


  beforeEach(() => {
    consoleInfoSpy = jest.spyOn(console, 'info')
    consoleWarnSpy = jest.spyOn(console, 'warn')
    consoleErrSpy = jest.spyOn(console, 'error')

    jest.resetModules()
    Object.assign(process.env, OLD_ENV)
    Object.assign(process.env, { NODE_ENV: undefined })
  })

  afterEach(() => {
    consoleErrSpy.mockRestore()
    consoleInfoSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    process.env = OLD_ENV
  })

  it('Logs error messages', () => {
    consoleMessageStrictMode('error', 'Testing error message')

    expect(console.error).toHaveBeenCalledTimes(1)
  })

  it('Logs info messages', () => {
    consoleMessageStrictMode('info', 'Testing info message')

    expect(console.info).toHaveBeenCalledTimes(1) // eslint-disable-line
  })

  it('Logs warning messages', () => {
    consoleMessageStrictMode('warn', 'Testing warning message')

    expect(console.warn).toHaveBeenCalledTimes(1)
  })

  it('Logs info messages on all other type options', () => {
    consoleMessageStrictMode(undefined, 'Testing default info message')

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1)
    expect(consoleErrSpy).toHaveBeenCalledTimes(0)
    expect(consoleWarnSpy).toHaveBeenCalledTimes(0)

  })

  it('Does not log messages in non-strict mode', () => {
    consoleMessageNotStrictMode('info', 'Testing info message')
    consoleMessageNotStrictMode('warn', 'Testing warning message')
    consoleMessageNotStrictMode('error', 'Testing error message')

    expect(console.info).not.toHaveBeenCalled() // eslint-disable-line
    expect(console.warn).not.toHaveBeenCalled()
    expect(console.error).not.toHaveBeenCalled()
  })

  it('does not log messages if process.NODE_ENV === production', () => {
    Object.assign(process.env, { NODE_ENV: 'production' })
    consoleMessageStrictMode('info', 'Testing production logging')
    consoleMessageStrictMode('warn', 'Testing production logging')
    consoleMessageStrictMode('error', 'Testing production logging')

    expect(consoleInfoSpy).not.toHaveBeenCalled()
    expect(consoleErrSpy).not.toHaveBeenCalled()
    expect(consoleWarnSpy).not.toHaveBeenCalled()
  })

  it('Logs errors on non-string messages', () => {
    consoleMessageStrictMode('info', { message: 'Message in object' })
    consoleMessageStrictMode('info', ['An', 'array', 'of', 'message'])
    consoleMessageStrictMode('info', () => 'Function message')

    const [[errorObject1], [errorObject2], [errorObject3]] = consoleErrSpy.mock.calls
    expect(errorObject1.name).toBe('Meta')
    expect(errorObject1.message).toMatch(
      "Param message needs to be of type: string. Instead, 'object' was provided",
    )

    expect(errorObject2.name).toBe('Meta')
    expect(errorObject2.message).toMatch(
      "Param message needs to be of type: string. Instead, 'object' was provided",
    )

    expect(errorObject3.name).toBe('Meta')
    expect(errorObject3.message).toMatch(
      "Param message needs to be of type: string. Instead, 'function' was provided",
    )
  })
})
