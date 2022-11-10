import fs from 'fs'
import path from 'path'

import { createConfig } from './createConfig'
import { UserConfig } from '../types'

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
  statSync: jest.fn(),
}))

describe('createConfig', () => {

  /**
   * @jest-environment node
   */
  describe('server side', () => {
    beforeAll(() => {
      Object.assign(process, { browser: false })
      delete (global as any).window
    })

    describe('when filesystem is as expected', () => {
      beforeAll(() => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readdirSync as jest.Mock).mockImplementation((locale)=>[`namespace-of-${locale.split('/').pop()}`]);
        // eslint-disable-next-line max-len
        (fs.statSync as jest.Mock).mockImplementation(()=>({isDirectory:()=>false}))
      })

      it('throws when lng is not provided', () => {
        expect(createConfig).toThrow('config.lng was not passed into createConfig')
      })

      it('returns a valid config when only lng is provided', () => {
        const config = createConfig({ lng: 'en' } as UserConfig)

        expect((config.backend as any).addPath).toMatch('/public/locales/{{lng}}/{{ns}}.missing.json')
        expect((config.backend as any).loadPath).toMatch('/public/locales/{{lng}}/{{ns}}.json')
        expect(config.defaultLocale).toBe('en')
        expect(config.defaultNS).toBe('common')
        expect(config.errorStackTraceLimit).toBe(0)
        expect(config.lng).toBe('en')
        expect(config.load).toBe('currentOnly')
        expect(config.localeExtension).toBe('json')
        expect(config.localePath).toBe('./public/locales')
        expect(config.localeStructure).toBe('{{lng}}/{{ns}}')
        expect(config.locales).toEqual(['en'])
        expect(config.ns).toEqual(['namespace-of-en'])
        expect(config.preload).toEqual(['en'])
        expect(config.use).toEqual([])
        expect(config.react?.useSuspense).toBe(false)
        expect(config.interpolation?.escapeValue).toBe(false)
        expect(config.interpolation?.format).toBeUndefined()

        expect(fs.existsSync).toHaveBeenCalledTimes(3)
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
        expect(config.ns).toEqual(['namespace-of-en-US', 'namespace-of-en', 'namespace-of-fr'])
      })

      it('deep merges backend', () => {
        const config = createConfig({
          backend: {
            hello: 'world',
          },
          i18n: {
            defaultLocale: 'en',
            locales: ['en'],
          },
          lng: 'en',
        } as UserConfig)
        expect((config.backend as any).hello).toBe('world')
        expect((config.backend as any).loadPath).toEqual(path.join(process.cwd(),'/public/locales/{{lng}}/{{ns}}.json'))
      })

      it('deep merges detection', () => {
        const config = createConfig({
          detection: {
            hello: 'world',
          },
          lng: 'en',
        } as UserConfig)
        expect((config.detection as any).hello).toBe('world')
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
        (fs.existsSync as jest.Mock).mockReset();
        (fs.existsSync as jest.Mock).mockReturnValueOnce(false)

        const config = createConfig.bind(null, {
          lng: 'en',
        } as UserConfig)

        expect(config).toThrow('Default namespace not found at public/locales/en/common.json')
      })

      it('does not throw an error if fallback exists', () => {
        (fs.existsSync as jest.Mock).mockReset();
        (fs.existsSync as jest.Mock).mockReturnValueOnce(false)
          .mockReturnValueOnce(true)

        const config = createConfig({
          fallbackLng: {
            'en-US': ['en'],
          },
          i18n: {
            defaultLocale: 'de',
            locales: ['de', 'en', 'en-US'],
          },
          lng: 'en-US',
        } as UserConfig)

        expect(config.fallbackLng).toStrictEqual({ 'en-US': ['en'] })
        expect(fs.existsSync).toHaveBeenCalledWith('public/locales/en-US/common.json')
        expect(fs.existsSync).toHaveBeenCalledWith('public/locales/en/common.json')
        expect(fs.existsSync).toHaveBeenCalledTimes(4)
      })

      it('does not throw error if fallbackLng has default key and it exists', () => {
        (fs.existsSync as jest.Mock).mockReset();
        (fs.existsSync as jest.Mock).mockReturnValueOnce(false)
          .mockReturnValueOnce(true)

        createConfig({
          fallbackLng: {
            default: ['en'],
          },
          i18n: {
            defaultLocale: 'de',
            locales: ['de', 'en', 'en-US'],
          },
          lng: 'en-US',
        } as UserConfig)

        expect(fs.existsSync).toHaveBeenCalledWith('public/locales/en-US/common.json')
        expect(fs.existsSync).toHaveBeenCalledWith('public/locales/en/common.json')
        expect(fs.existsSync).toHaveBeenCalledTimes(4)
      })


      it('does not throw an error if fallback (as function) exists', () => {
        (fs.existsSync as jest.Mock).mockReset();
        (fs.existsSync as jest.Mock).mockReturnValueOnce(false)
          .mockReturnValueOnce(true)

        const config = createConfig({
          fallbackLng: (code) => code.split('-')[0],
          i18n: {
            defaultLocale: 'de',
            locales: ['de', 'en', 'en-US'],
          },
          lng: 'en-US',
        } as UserConfig)

        expect(typeof config.fallbackLng).toBe('function')
        expect(fs.existsSync).toHaveBeenCalledWith('public/locales/en-US/common.json')
        expect(fs.existsSync).toHaveBeenCalledWith('public/locales/en/common.json')
        expect(fs.existsSync).toHaveBeenCalledTimes(4)
      })

      it('does not throw an error if nonExplicitSupportedLngs is true', () => {
        (fs.existsSync as jest.Mock).mockReset();
        (fs.existsSync as jest.Mock).mockReturnValueOnce(false)
          .mockReturnValueOnce(true)

        const config = createConfig({
          i18n: {
            defaultLocale: 'de',
            locales: ['de', 'en-US'],
          },
          lng: 'en-US',
          nonExplicitSupportedLngs: true,
        } as UserConfig)

        expect(typeof config.nonExplicitSupportedLngs).toBe('boolean')
        expect(fs.existsSync).toHaveBeenCalledWith('public/locales/en-US/common.json')
        expect(fs.existsSync).toHaveBeenCalledWith('public/locales/en/common.json')
        expect(fs.existsSync).toHaveBeenCalledTimes(5)
      })

      it('uses user provided prefix/suffix with localeStructure', () => {
        (fs.existsSync as jest.Mock).mockReset();
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
      const localePathFn: UserConfig['localePath'] = (locale, namespace, missing) => `${missing}/${namespace}/${locale}.json`

      it('returns a config whose localePath works as expected', () => {
        (fs.existsSync as jest.Mock).mockReturnValueOnce(true)
        const config = createConfig({
          i18n: {
            defaultLocale: 'en',
            locales: ['en'],
          },
          lng: 'en',
          localePath: localePathFn,
          ns: ['common'],
        })

        expect(((config.backend as any).loadPath)('en', 'common')).toBe('false/common/en.json')
        expect(((config.backend as any).addPath)('en', 'common')).toBe('true/common/en.json')
      })

      it('when filesystem is missing defaultNS throws an error', () => {
        (fs.existsSync as jest.Mock).mockReturnValueOnce(false)

        const config = createConfig.bind(null, {
          lng: 'en',
          localePath: localePathFn,
        } as UserConfig)

        expect(config).toThrow('Default namespace not found at false/common/en.json')
      })

      it('throws an error if namespaces are not provided', () => {
        (fs.existsSync as jest.Mock).mockReturnValueOnce(true)
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

    describe('with default as locale', () => {
      beforeAll(() => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readdirSync as jest.Mock).mockImplementation((locale)=>[`namespace-of-${locale.split('/').pop()}`]);
        // eslint-disable-next-line max-len
        (fs.statSync as jest.Mock).mockImplementation(()=>({isDirectory:()=>false}))
      })
      // eslint-disable-next-line max-len
      // https://nextjs.org/docs/advanced-features/i18n-routing#prefixing-the-default-locale
      it('should ignore the default value', () => {
        const config = createConfig({
          i18n: {
            defaultLocale: 'default',
            locales: ['default', 'en', 'de'],
          },
          lng: 'de',
        })
        expect(config.fallbackLng).toBe('en')
        expect(config.preload).toEqual(['en', 'de'])
      })
    })

    describe('when filesystem contains nested namespace structure', () => {
      beforeAll(() => {
        (fs.existsSync as jest.Mock).mockReset();
        (fs.readdirSync as jest.Mock).mockReset();
        (fs.statSync as jest.Mock).mockReset();
        (fs.existsSync as jest.Mock).mockReturnValue(true)
        let level = 0;
        (fs.readdirSync as jest.Mock).mockImplementation((locale)=>level === 0 ? ['sub-folder'] : [`namespace-of-${locale.split('/').pop()}`]);
        // eslint-disable-next-line max-len
        (fs.statSync as jest.Mock).mockImplementation(()=>({isDirectory:()=>++level>1?false:true}))
      })

      it('returns a valid config', () => {
        const config = createConfig({ lng: 'en' } as UserConfig)

        expect((config.backend as any).addPath).toMatch('/public/locales/{{lng}}/{{ns}}.missing.json')
        expect((config.backend as any).loadPath).toMatch('/public/locales/{{lng}}/{{ns}}.json')
        expect(config.defaultLocale).toBe('en')
        expect(config.defaultNS).toBe('common')
        expect(config.errorStackTraceLimit).toBe(0)
        expect(config.lng).toBe('en')
        expect(config.load).toBe('currentOnly')
        expect(config.localeExtension).toBe('json')
        expect(config.localePath).toBe('./public/locales')
        expect(config.localeStructure).toBe('{{lng}}/{{ns}}')
        expect(config.locales).toEqual(['en'])
        expect(config.ns).toEqual(['sub-folder/namespace-of-sub-folder'])
        expect(config.preload).toEqual(['en'])
        expect(config.use).toEqual([])
        expect(config.react?.useSuspense).toBe(false)
        expect(config.interpolation?.escapeValue).toBe(false)
        expect(config.interpolation?.format).toBeUndefined()

        expect(fs.existsSync).toHaveBeenCalledTimes(4)
        expect(fs.readdirSync).toHaveBeenCalledTimes(2)
        expect(fs.statSync).toHaveBeenCalledTimes(2)
      })
    })
  })

  /**
   * @jest-environment jsdom
   */
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
      expect(config.defaultLocale).toBe('en')
      expect(config.defaultNS).toBe('common')
      expect(config.errorStackTraceLimit).toBe(0)
      expect(config.lng).toBe('en')
      expect(config.load).toBe('currentOnly')
      expect(config.localeExtension).toBe('json')
      expect(config.localePath).toBe('./public/locales')
      expect(config.localeStructure).toBe('{{lng}}/{{ns}}')
      expect(config.locales).toEqual(['en'])
      expect(config.ns).toEqual(['common'])
      expect(config.preload).toBeUndefined()
      expect(config.use).toEqual([])
      expect(config.react?.useSuspense).toBe(false)
      expect(config.interpolation?.escapeValue).toBe(false)
      expect(config.interpolation?.format).toBeUndefined()
    })

    it('deep merges backend', () => {
      const config = createConfig({
        backend: {
          hello: 'world',
        },
        i18n: {
          defaultLocale: 'en',
          locales: ['en'],
        },
        lng: 'en',
      } as UserConfig)
      expect((config.backend as any).hello).toBe('world')
      expect((config.backend as any).loadPath).toMatch('/locales/{{lng}}/{{ns}}.json')
    })

    it('returns ns as [defaultNS]', () => {
      const config = createConfig({ defaultNS: 'core', lng: 'en' } as UserConfig)
      expect(config.ns).toEqual(['core'])
    })

    it('returns ns when provided as a string', () => {
      const config = createConfig({ lng: 'en', ns: 'core' } as UserConfig)
      expect(config.ns).toBe('core')
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
          i18n: {
            defaultLocale: 'en',
            locales: ['en'],
          },
          lng: 'en',
          use: [{
            type: 'backend',
          }] } as UserConfig)
        expect((config.backend as any)).toEqual({ hello: 'world' })
      })
    })

    describe('with a function for localePath', () => {
      const localePathFn: UserConfig['localePath'] = (locale, namespace, missing) => `${missing}/${namespace}/${locale}.json`

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

        expect(((config.backend as any).loadPath)('en', 'common')).toBe('false/common/en.json')
        expect(((config.backend as any).addPath)('en', 'common')).toBe('true/common/en.json')
      })
    })
  })
})
