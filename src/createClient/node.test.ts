import createClientNode from './node'

const config = {
  defaultLocale: 'en',
  locales: ['en', 'de'],
  use: [],
} as any

describe('createClientNode', () => {
  const client = createClientNode(config)
  it('returns a node client', () => {
    expect(typeof client.initPromise.then).toBe('function')
    expect(typeof client.i18n.addResource).toBe('function')
    expect(typeof (client.i18n as any).translator).toBe('object')
    expect(
      (client.i18n.options as any).defaultLocale
    ).toEqual(config.defaultLocale)
    expect((client.i18n.options as any).locales).toEqual(config.locales)
    expect((client.i18n.options as any).isClone).not.toBe(true)
  })

  describe('createClientNode a second time should return a clone of i18next', () => {
    it('returns a node client', () => {
      const secondClient = createClientNode(config)
      expect(typeof secondClient.initPromise.then).toBe('function')
      expect(typeof secondClient.i18n.addResource).toBe('function')
      expect(typeof (secondClient.i18n as any).translator).toBe('object')
      expect(
        (secondClient.i18n.options as any).defaultLocale
      ).toEqual(config.defaultLocale)
      expect((secondClient.i18n.options as any).locales).toEqual(config.locales)
      expect((secondClient.i18n.options as any).isClone).toBe(true)
      expect(secondClient).not.toEqual(client)
      expect((secondClient as any).store).toEqual((client as any).store)
    })
  })
})
