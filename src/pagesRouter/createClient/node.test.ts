/**
 * @jest-environment node
 */

import fs from 'fs'
import os from 'os'
import path from 'path'

import createClientNode from './node'

let onPreInitI18nextCalled: any

const config = {
  defaultLocale: 'en',
  locales: ['en', 'de'],
  onPreInitI18next: (i18n: any) => {
    onPreInitI18nextCalled = i18n
  },
  use: [],
} as any

describe('createClientNode', () => {
  let client: { i18n: any; initPromise: any }

  beforeEach(() => {
    onPreInitI18nextCalled = null
  })

  it('returns a node client', () => {
    client = createClientNode(config)
    expect(typeof client.initPromise.then).toBe('function')
    expect(typeof client.i18n.addResource).toBe('function')
    expect(typeof (client.i18n as any).translator).toBe('object')
    expect((client.i18n.options as any).defaultLocale).toEqual(
      config.defaultLocale
    )
    expect((client.i18n.options as any).locales).toEqual(
      config.locales
    )
    expect((client.i18n.options as any).isClone).not.toBe(true)
    expect(onPreInitI18nextCalled).toEqual(client.i18n)
  })

  describe('createClientNode a second time should return a clone of i18next', () => {
    it('returns a node client', () => {
      const secondClient = createClientNode(config)
      expect(typeof secondClient.initPromise.then).toBe('function')
      expect(typeof secondClient.i18n.addResource).toBe('function')
      expect(typeof (secondClient.i18n as any).translator).toBe(
        'object'
      )
      expect(
        (secondClient.i18n.options as any).defaultLocale
      ).toEqual(config.defaultLocale)
      expect((secondClient.i18n.options as any).locales).toEqual(
        config.locales
      )
      expect((secondClient.i18n.options as any).isClone).toBe(true)
      expect(secondClient).not.toEqual(client)
      expect((secondClient as any).store).toEqual(
        (client as any).store
      )
      expect(onPreInitI18nextCalled).toBeNull()
    })
  })
})

describe('createClientNode with a custom interpolation prefix/suffix', () => {
  let localesDir: string

  beforeAll(() => {
    localesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'next-i18next-'))
    fs.mkdirSync(path.join(localesDir, 'de'))
    fs.writeFileSync(
      path.join(localesDir, 'de', 'common.json'),
      '{ "greeting": "Hallo {name}" }'
    )
  })

  afterAll(() => {
    fs.rmSync(localesDir, { recursive: true, force: true })
  })

  it('loads the file from a loadPath that uses the same prefix/suffix', async () => {
    // Fresh module, so the default backend is created from this config
    let createFreshClient = createClientNode
    jest.isolateModules(() => {
      createFreshClient = require('./node').default
    })

    const { i18n, initPromise } = createFreshClient({
      backend: {
        loadPath: path.join(localesDir, '{lng}', '{ns}.json'),
      },
      interpolation: { prefix: '{', suffix: '}' },
      lng: 'de',
      ns: ['common'],
      use: [],
    } as any)
    await initPromise

    expect(i18n.t('common:greeting', { name: 'Anna' })).toBe('Hallo Anna')
  })
})
