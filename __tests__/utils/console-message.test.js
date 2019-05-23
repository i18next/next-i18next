/* eslint-disable no-console */
/* eslint-env jest */

import { consoleMessage as _consoleMessage } from '../../src/utils'

const consoleMessage = _consoleMessage.bind({
  config: {
    strictMode: true,
    errorStackTraceLimit: 0,
  },
})

const consoleMessageNotStrictMode = _consoleMessage.bind({
  config: {
    strictMode: false,
  },
})

describe('consoleMessage utility function', () => {
  const OLD_ENV = process.env

  let consoleInfoSpy
  let consoleWarnSpy
  let consoleErrSpy


  beforeEach(() => {
    consoleInfoSpy = jest.spyOn(console, 'info')
    consoleWarnSpy = jest.spyOn(console, 'warn')
    consoleErrSpy = jest.spyOn(console, 'error')

    jest.resetModules() // this is important
    process.env = { ...OLD_ENV }
    delete process.env.NODE_ENV
  })

  afterEach(() => {
    consoleErrSpy.mockRestore()
    consoleInfoSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    process.env = OLD_ENV
  })

  it('Logs error messages', () => {
    consoleMessage('error', 'Testing error message')

    expect(console.error).toHaveBeenCalledTimes(1)
  })

  it('Logs info messages', () => {
    consoleMessage('info', 'Testing info message')

    expect(console.info).toHaveBeenCalledTimes(1)
  })

  it('Logs warning messages', () => {
    consoleMessage('warn', 'Testing warning message')

    expect(console.warn).toHaveBeenCalledTimes(1)
  })

  it('Logs info messages on all other type options', () => {
    consoleMessage(undefined, 'Testing default info message')

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1)
    expect(consoleErrSpy).toHaveBeenCalledTimes(0)
    expect(consoleWarnSpy).toHaveBeenCalledTimes(0)

  })

  it('Does not log messages in non-strict mode', () => {
    consoleMessageNotStrictMode('info', 'Testing info message')
    consoleMessageNotStrictMode('warn', 'Testing warning message')
    consoleMessageNotStrictMode('error', 'Testing error message')

    expect(console.info).not.toHaveBeenCalled()
    expect(console.warn).not.toHaveBeenCalled()
    expect(console.error).not.toHaveBeenCalled()
  })

  it('does not log messages if process.NODE_ENV === production', () => {
    process.env.NODE_ENV = 'production'
    consoleMessage('info', 'Testing production logging')
    consoleMessage('warn', 'Testing production logging')
    consoleMessage('error', 'Testing production logging')

    expect(consoleInfoSpy).not.toHaveBeenCalled()
    expect(consoleErrSpy).not.toHaveBeenCalled()
    expect(consoleWarnSpy).not.toHaveBeenCalled()
  })

  it('Logs errors on non-string messages', () => {
    consoleMessage('info', { message: 'Message in object' })
    consoleMessage('info', ['An', 'array', 'of', 'message'])
    consoleMessage('info', () => 'Function message')

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
