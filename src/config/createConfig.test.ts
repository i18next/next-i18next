import fs from 'fs'
import path from 'path'

import { createConfig } from './createConfig'
import { UserConfig } from '../types'

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
}))

describe('createConfig', () => {

  describe('server side', () => {
    beforeAll(() => {
      Object.assign(process, { browser: false })
      delete (global as any).window
    })

    describe('when filesystem is as expected', () => {
      beforeAll(() => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readdirSync as jest.Mock).mockImplementation((locale)=>[`namespace-of-${locale.split('/').pop()}`])
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
        expect(config.ns).toEqual(['namespace-of-en'])
        expect(config.preload).toEqual(['en'])
        expect(config.strictMode).toEqual(true)
        expect(config.use).toEqual([])
        expect(config.react?.useSuspense).toEqual(false)
        expect(config.interpolation?.escapeValue).toEqual(false)
        expect(config.interpolation?.format).toBeUndefined()

        expect(fs.existsSync).toHaveBeenCalledTimes(1)
        expect(fs.readdirSync).toHaveBeenCalledTimes(1)
      })

      it('gets namespaces from current language + fallback (as string) when ns is not provided', ()=>{
        const config = createConfig({ fallbackLng:'en', lng: 'en-US' } as UserConfig)
        expect(config.ns).toEqual(['namespace-of-en-US', 'namespace-of-en'])
      })

      it('gets namespaces from current language + fallback (as array) when ns is not provided', ()=>{
        const config = createConfig({ fallbackLng: ['en', 'fr'], lng: 'en-US' } as any)
        expect(config.ns).toEqual(['namespace-of-en-US', 'namespace-of-en', 'namespace-of-fr'])
      })

      it('gets namespaces from current language + fallback (as object) when ns is not provided', ()=>{
        const fallbackLng = { default: ['fr'], 'en-US': ['en'] } as unknown
        const config = createConfig({ fallbackLng, lng: 'en-US' } as UserConfig)
        expect(config.ns).toEqual(['namespace-of-en-US', 'namespace-of-fr', 'namespace-of-en'])
      })

      it('deep merges backend', () => {
        const config = createConfig({
          backend: {
            hello: 'world',
          },
          lng: 'en',
        } as UserConfig)
        expect((config.backend as any).hello).toEqual('world')
        expect((config.backend as any).loadPath).toEqual(path.join(process.cwd(),'/public/locales/{{lng}}/{{ns}}.json'))
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

      describe('fallbackLng', () => {
        it('automatically sets if it user does not provide', () => {
          const config = createConfig({
            lng: 'en',
          } as UserConfig)

          expect(config.fallbackLng).toBe('en')
        })

        it('does not overwrite user provided value', () => {
          const config = createConfig({
            fallbackLng: 'hello-world',
            lng: 'en',
          } as UserConfig)

          expect(config.fallbackLng).toBe('hello-world')
        })

        it('does not overwrite user provided boolean', () => {
          const config = createConfig({
            fallbackLng: false,
            lng: 'en',
          } as UserConfig)

          expect(config.fallbackLng).toBe(false)
        })
      })
    })

    describe('defaultNS validation', () => {
      it('when filesystem is missing defaultNS throws an error', () => {
        (fs.existsSync as jest.Mock).mockReturnValueOnce(false)

        const config = createConfig.bind(null, {
          lng: 'en',
        } as UserConfig)

        expect(config).toThrow('Default namespace not found at public/locales/en/common.json')
      })

      it('uses user provided prefix/suffix with localeStructure', () => {
        (fs.existsSync as jest.Mock).mockReturnValueOnce(false)

        const config = createConfig.bind(null, {
          interpolation: {
            prefix: '^^',
            suffix: '$$',
          },
          lng: 'en',
          localeStructure: '^^lng$$/^^ns$$',
        } as UserConfig)

        expect(config).toThrow('Default namespace not found at public/locales/en/common.json')
        expect(fs.existsSync).toHaveBeenCalledWith('public/locales/en/common.json')
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

    describe('with a function for localePath', () => {
      const localePathFn: UserConfig['localePath'] = (locale, namespace, env, missing) => `${missing}/${env}/${namespace}/${locale}.json`

      it('returns a config whose localePath works as expected', () => {
        const config = createConfig({
          i18n: {
            defaultLocale: 'en',
            locales: ['en'],
          },
          lng: 'en',
          localePath: localePathFn,
          ns: ['common'],
        })

        expect(((config.backend as any).loadPath)('en', 'common')).toBe('false/server/common/en.json')
        expect(((config.backend as any).addPath)('en', 'common')).toBe('true/server/common/en.json')
      })

      it('throws an error if namespaces are not provided', () => {
        expect(() => createConfig({
          i18n: {
            defaultLocale: 'en',
            locales: ['en'],
          },
          lng: 'en',
          localePath: localePathFn,
        })).toThrow('Must provide all namespaces in ns option if using a function as localePath')
      })
    })
  })

  describe('client side', () => {
    beforeAll(() => {
      Object.assign(process, { browser: true })
      global.window = {} as any
    })

    it('throws when lng is not provided', () => {
      expect(createConfig).toThrow('config.lng was not passed into createConfig')
    })

    it('returns a valid config when only lng is provided', () => {
      const config = createConfig({ lng: 'en' } as UserConfig)

      expect((config.backend as any).addPath).toMatch('/locales/{{lng}}/{{ns}}.missing.json')
      expect((config.backend as any).loadPath).toMatch('/locales/{{lng}}/{{ns}}.json')
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
      expect(config.react?.useSuspense).toEqual(false)
      expect(config.interpolation?.escapeValue).toEqual(false)
      expect(config.interpolation?.format).toBeUndefined()
    })

    it('deep merges backend', () => {
      const config = createConfig({
        backend: {
          hello: 'world',
        },
        lng: 'en',
      } as UserConfig)
      expect((config.backend as any).hello).toEqual('world')
      expect((config.backend as any).loadPath).toMatch('/locales/{{lng}}/{{ns}}.json')
    })

    it('returns ns as [defaultNS]', () => {
      const config = createConfig({ defaultNS: 'core', lng: 'en' } as UserConfig)
      expect(config.ns).toEqual(['core'])
    })

    it('returns ns when provided as a string', () => {
      const config = createConfig({ lng: 'en', ns: 'core' } as UserConfig)
      expect(config.ns).toEqual('core')
    })

    it('returns ns when provided as an array', () => {
      const config = createConfig({ lng: 'en', ns: ['core', 'page'] } as any)
      expect(config.ns).toEqual(['core', 'page'])
    })

    describe('hasCustomBackend', () => {
      it('returns the correct configuration', () => {
        const config = createConfig({
          backend: {
            hello: 'world',
          },
          lng: 'en',
          use: [{
            type: 'backend',
          }] } as UserConfig)
        expect((config.backend as any)).toEqual({ hello: 'world' })
      })
    })

    describe('with a function for localePath', () => {
      const localePathFn: UserConfig['localePath'] = (locale, namespace, env, missing) => `${missing}/${env}/${namespace}/${locale}.json`

      it('returns a config whose localePath works as expected', () => {
        const config = createConfig({
          i18n: {
            defaultLocale: 'en',
            locales: ['en'],
          },
          lng: 'en',
          localePath: localePathFn,
          ns: ['common'],
        })

        expect(((config.backend as any).loadPath)('en', 'common')).toBe('false/client/common/en.json')
        expect(((config.backend as any).addPath)('en', 'common')).toBe('true/client/common/en.json')
      })
    })
  })
})
