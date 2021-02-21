import fs from 'fs'
import { createConfig } from './createConfig'
import { UserConfig } from '../../types'

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
}))

describe('createConfig', () => {

  describe('server side', () => {
    beforeAll(() => {
      Object.assign(process, { browser: false })
    })

    describe('when filesystem is as expected', () => {
      beforeAll(() => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readdirSync as jest.Mock).mockReturnValue([])
      })

      it('throws when lng is not provided', () => {
        expect(createConfig).toThrow('config.lng was not passed into createConfig')
      })

      it('returns a valid config when only lng is provided', () => {
        const config = createConfig({ lng: 'en' } as UserConfig)

        expect((config.backend as any).addPath).toMatch('/public/locales/{{lng}}/{{ns}}.missing.json')
        expect((config.backend as any).loadPath).toMatch('/public/locales/{{lng}}/{{ns}}.json')
        expect(config.defaultLocale).toEqual('en')
        expect(config.defaultNS).toEqual('common')
        expect(config.errorStackTraceLimit).toEqual(0)
        expect(config.lng).toEqual('en')
        expect(config.load).toEqual('currentOnly')
        expect(config.localeExtension).toEqual('json')
        expect(config.localePath).toEqual('./public/locales')
        expect(config.localeStructure).toEqual('{{lng}}/{{ns}}')
        expect(config.locales).toEqual(['en'])
        expect(config.ns).toEqual([])
        expect(config.preload).toEqual(['en'])
        expect(config.strictMode).toEqual(true)
        expect(config.use).toEqual([])

        expect(fs.existsSync).toHaveBeenCalledTimes(1)
        expect(fs.readdirSync).toHaveBeenCalledTimes(1)
      })

      it('deep merges backend', () => {
        const config = createConfig({
          backend: {
            hello: 'world',
          },
          lng: 'en',
        } as UserConfig)
        expect((config.backend as any).hello).toEqual('world')
      })

      it('deep merges detection', () => {
        const config = createConfig({
          detection: {
            hello: 'world',
          },
          lng: 'en',
        } as UserConfig)
        expect((config.detection as any).hello).toEqual('world')
      })
    })

    describe('when filesystem is missing defaultNS', () => {
      it('throws an error', () => {
        (fs.existsSync as jest.Mock).mockReturnValueOnce(false)

        const config = createConfig.bind(null, {
          lng: 'en',
        })

        expect(config).toThrow('Default namespace not found at public/locales/en/common.json')
      })
    })

    describe('hasCustomBackend', () => {
      it('returns a config without calling any fs methods', () => {
        (fs.existsSync as jest.Mock).mockReset();
        (fs.readdirSync as jest.Mock).mockReset()

        createConfig({
          lng: 'en', use: [{
            type: 'backend',
          }] } as UserConfig)

        expect(fs.existsSync).toHaveBeenCalledTimes(0)
        expect(fs.readdirSync).toHaveBeenCalledTimes(0)
      })
    })

    describe('ci mode', () => {
      it('returns a config without calling any fs methods', () => {
        createConfig({ lng: 'cimode' } as UserConfig)

        expect(fs.existsSync).toHaveBeenCalledTimes(0)
        expect(fs.readdirSync).toHaveBeenCalledTimes(0)
      })
    })
  })

  describe('client side', () => {
    beforeAll(() => {
      Object.assign(process, { browser: true })
    })

    it('throws when lng is not provided', () => {
      expect(createConfig).toThrow('config.lng was not passed into createConfig')
    })

    it('returns a valid config when only lng is provided', () => {
      const config = createConfig({ lng: 'en' } as UserConfig)

      expect((config.backend as any).addPath).toMatch('/public/locales/{{lng}}/{{ns}}.missing.json')
      expect((config.backend as any).loadPath).toMatch('/public/locales/{{lng}}/{{ns}}.json')
      expect(config.defaultLocale).toEqual('en')
      expect(config.defaultNS).toEqual('common')
      expect(config.errorStackTraceLimit).toEqual(0)
      expect(config.lng).toEqual('en')
      expect(config.load).toEqual('currentOnly')
      expect(config.localeExtension).toEqual('json')
      expect(config.localePath).toEqual('./public/locales')
      expect(config.localeStructure).toEqual('{{lng}}/{{ns}}')
      expect(config.locales).toEqual(['en'])
      expect(config.ns).toEqual(['common'])
      expect(config.preload).toBeUndefined()
      expect(config.strictMode).toEqual(true)
      expect(config.use).toEqual([])
    })
  })
})
