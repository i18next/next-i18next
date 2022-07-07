import createClientBrowser from './browser'

const config = {
  defaultLocale: 'en',
  locales: ['en', 'de'],
  use: [],
} as any

describe('createClientBrowser', () => {
  it('returns a browser client', () => {
    const client = createClientBrowser(config)
    expect(typeof client.initPromise.then).toBe('function')
    expect(typeof client.i18n.addResource).toBe('function')
    expect(typeof (client.i18n as any).translator).toBe('object')
    expect(
      (client.i18n.options as any).defaultLocale
    ).toEqual(config.defaultLocale)
    expect((client.i18n.options as any).locales).toEqual(config.locales)
  })
})
