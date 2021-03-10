import createClientNode from './node'

const config = {
  defaultLocale: 'en',
  locales: ['en', 'de'],
  use: [],
} as any

describe('createClientNode', () => {
  it('returns a node client', () => {
    const client = createClientNode(config)
    expect(typeof client.initPromise.then).toEqual('function')
    expect(typeof client.i18n.addResource).toEqual('function')
    expect(typeof (client.i18n as any).translator).toEqual('object')
    expect(
      (client.i18n.options as any).defaultLocale
    ).toEqual(config.defaultLocale)
    expect((client.i18n.options as any).locales).toEqual(config.locales)
  })
})
