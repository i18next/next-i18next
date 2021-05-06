import fs from 'fs'
import path from 'path'
import { UserConfig } from './types'
import { DEFAULT_CONFIG_PATH, serverSideTranslations } from './serverSideTranslations'

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
}))

jest.mock('path', () => ({
  resolve: jest.fn(),
}))


describe('serverSideTranslations', () => {
  describe('external config', () => {
    beforeEach(() => {
      (fs.readdirSync as jest.Mock).mockReturnValue([])
    })
    afterEach(jest.resetAllMocks)

    it('should try to import the default user config file if no override is passed', async () => {
      const config = {
        i18n: {
          defaultLocale: 'en-US',
          locales: ['en-US', 'fr-CA'],
        },
      };
      (fs.existsSync as jest.Mock).mockReturnValue(true)
      const pathMock = (path.resolve as jest.Mock).mockReturnValue('next-i18next.config.js')

      jest.mock('next-i18next.config.js', () => (config))
      const props = await serverSideTranslations('en-US', undefined, undefined)

      expect(pathMock).toHaveBeenCalledWith(DEFAULT_CONFIG_PATH)
      expect(props._nextI18Next?.userConfig?.i18n).toEqual(config?.i18n)
    })

    it('should throw when no config is present', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false)

      await expect(serverSideTranslations('en-US', undefined as any))
        .rejects
        .toThrow('next-i18next was unable to find a user config or one was not passed to serverSideTranslations')
    })
  })

  describe('default', () => {
    beforeEach(() => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
      (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
      (fs.readdirSync as jest.Mock).mockReturnValue([])
    })
    afterEach(jest.resetAllMocks)

    it('throws if initialLocale is not passed', async () => {
      await expect(serverSideTranslations(undefined as any))
        .rejects
        .toThrow('Initial locale argument was not passed into serverSideTranslations')
    })

    it('returns all namespaces if namespacesRequired is not provided', async () => {
      (fs.readdirSync as jest.Mock).mockReturnValue(['one', 'two', 'three']);
      (path.resolve as jest.Mock).mockReturnValueOnce('/public/locales/en-US')
      const overrideConfig = {
        i18n: {
          defaultLocale: 'en-US',
          locales: ['en-US', 'fr-CA'],
        },
      } as UserConfig


      const props = await serverSideTranslations('en-US', undefined, overrideConfig)
      expect(path.resolve).toHaveBeenCalledWith(process.cwd(), `./public/locales/${overrideConfig.i18n.defaultLocale}`)
      expect(fs.readdirSync).toHaveBeenCalledTimes(1)
      expect(fs.readdirSync).toHaveBeenCalledWith(expect.stringMatching('/public/locales/en-US'))
      expect(Object.values(props._nextI18Next.initialI18nStore))
        .toEqual([{ one: {}, three: {}, two: {} }])
    })

    it('returns props', async () => {
      const props = await serverSideTranslations('en-US', [], {
        i18n: {
          defaultLocale: 'en-US',
          locales: ['en-US', 'fr-CA'],
        },
      } as UserConfig)

      expect(props).toEqual({
        _nextI18Next: {
          initialI18nStore: {
            'en-US': {},
          },
          userConfig: {
            i18n: {
              defaultLocale: 'en-US',
              locales: ['en-US', 'fr-CA'],
            },
          },
        },
      })
    })
  })
})
