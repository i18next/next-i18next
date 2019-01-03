/* eslint-disable no-console */
/* eslint-env jest */

import { createConsoleMessage } from 'utils'


describe('createConsoleMessage utility function', () => {
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
    createConsoleMessage('error', 'Testing error message')

    expect(console.error).toHaveBeenCalledTimes(1)
  })

  it('Logs info messages', () => {
    createConsoleMessage('info', 'Testing info message')

    expect(console.info).toHaveBeenCalledTimes(1)
  })

  it('Logs warning messages', () => {
    createConsoleMessage('warn', 'Testing warning message')

    expect(console.warn).toHaveBeenCalledTimes(1)
  })

  it('Logs info messages on all other type options', () => {
    createConsoleMessage(undefined, 'Testing default info message')

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1)
    expect(consoleErrSpy).toHaveBeenCalledTimes(0)
    expect(consoleWarnSpy).toHaveBeenCalledTimes(0)

  })

  it('Returns undefined if process.NODE_ENV === production', () => {
    process.env.NODE_ENV = 'production'
    expect(createConsoleMessage('info', 'Testing production logging')).toBeUndefined()

  })

  it('Returns undefined if process.NODE_ENV !== test jest', () => {
    process.env.NODE_ENV = 'test jest'
    expect(createConsoleMessage('info', 'Testing test logging')).toBeUndefined()

  })


  it('Returns undefined if strictMode is false', () => {
    process.env.NODE_ENV = 'production'
    expect(createConsoleMessage('info', 'Testing production logging', { strictMode: false })).toBeUndefined()

  })

  it('Return errors on non-string messages', () => {
    expect(createConsoleMessage('info', { message: 'Message in object' })).toBeUndefined()
    expect(createConsoleMessage('info', ['An', 'array', 'of', 'message'])).toBeUndefined()
    expect(createConsoleMessage('info', () => 'Function message')).toBeUndefined()
  })
})
