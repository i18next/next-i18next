/**
 * @jest-environment jsdom
 */

import createClientBrowser from './browser'

let onPreInitI18nextCalled: any

const config = {
  defaultLocale: 'en',
  locales: ['en', 'de'],
  onPreInitI18next: (i18n: any) => {
    onPreInitI18nextCalled = i18n
  },
  use: [],
} as any

describe('createClientBrowser', () => {
  beforeEach(() => {
    onPreInitI18nextCalled = null
  })

  it('returns a browser client', () => {
    const client = createClientBrowser(config)
    expect(typeof client.initPromise.then).toBe('function')
    expect(typeof client.i18n.addResource).toBe('function')
    expect(typeof (client.i18n as any).translator).toBe('object')
    expect(
      (client.i18n.options as any).defaultLocale
    ).toEqual(config.defaultLocale)
    expect((client.i18n.options as any).locales).toEqual(config.locales)
    expect(onPreInitI18nextCalled).toEqual(client.i18n)
  })
})
