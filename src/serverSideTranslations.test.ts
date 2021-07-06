import fs from 'fs'
import { UserConfig } from './types'
import { serverSideTranslations } from './serverSideTranslations'

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
}))

describe('serverSideTranslations', () => {
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

  describe('When namespacesRequired is not provided', ()=>{
    beforeEach(() =>{
      (fs.readdirSync as jest.Mock).mockImplementation((path)=>['common', `namespace-of-${path.split('/').pop()}`])
    })

    it('returns all namespaces', async () => {
      const props = await serverSideTranslations('en-US', undefined, {
        i18n: {
          defaultLocale: 'en-US',
          locales: ['en-US', 'fr-CA'],
        },
      } as UserConfig)
      expect(fs.existsSync).toHaveBeenCalledTimes(0)
      expect(fs.readdirSync).toHaveBeenCalledTimes(1)
      expect(fs.readdirSync).toHaveBeenCalledWith(expect.stringMatching('/public/locales/en-US'))
      expect(props._nextI18Next.initialI18nStore)
        .toEqual({
          'en-US': {
            common: {},
            'namespace-of-en-US': {},
          },
        })
    })

    it('returns all namespaces with fallbackLng (as string)', async () => {
      const props = await serverSideTranslations('en-US', undefined, {
        i18n: {
          defaultLocale: 'fr-BE',
          fallbackLng: 'fr',
          locales: ['nl-BE', 'fr-BE'],
        },
      } as UserConfig)
      expect(fs.readdirSync).toHaveBeenCalledTimes(2)
      expect(fs.readdirSync).toHaveBeenCalledWith(expect.stringMatching('/public/locales/fr'))
      expect(props._nextI18Next.initialI18nStore)
        .toEqual({
          'en-US': {
            common: {},
            'namespace-of-en-US': {},
            'namespace-of-fr': {},
          },
          fr: {
            common: {},
            'namespace-of-en-US': {},
            'namespace-of-fr': {},
          },
        })
    })

    it('returns all namespaces with fallbackLng (as array)', async () => {
      const props = await serverSideTranslations('en-US', undefined, {
        i18n: {
          defaultLocale: 'en-US',
          fallbackLng: ['en','fr'],
          locales: ['en-US', 'fr-CA'],
        },
      } as UserConfig)
      expect(fs.readdirSync).toHaveBeenCalledTimes(3)
      expect(fs.readdirSync).toHaveBeenCalledWith(expect.stringMatching('/public/locales/en-US'))
      expect(fs.readdirSync).toHaveBeenCalledWith(expect.stringMatching('/public/locales/en'))
      expect(fs.readdirSync).toHaveBeenCalledWith(expect.stringMatching('/public/locales/fr'))
      expect(props._nextI18Next.initialI18nStore)
        .toEqual({
          en: {
            common: {},
            'namespace-of-en': {},
            'namespace-of-en-US': {},
            'namespace-of-fr': {},
          },
          'en-US': {
            common: {},
            'namespace-of-en': {},
            'namespace-of-en-US': {},
            'namespace-of-fr': {},
          },
          fr: {
            common: {},
            'namespace-of-en': {},
            'namespace-of-en-US': {},
            'namespace-of-fr': {},
          },
        })
    })

    it('returns all namespaces with fallbackLng (as object)', async () => {
      const props = await serverSideTranslations('en-US', undefined, {
        i18n: {
          defaultLocale: 'nl-BE',
          fallbackLng: {default:['fr'], 'nl-BE':['en']},
          locales: ['nl-BE', 'fr-BE'],
        },
      } as UserConfig)
      expect(fs.readdirSync).toHaveBeenCalledTimes(3)
      expect(fs.readdirSync).toHaveBeenCalledWith(expect.stringMatching('/public/locales/en'))
      expect(fs.readdirSync).toHaveBeenCalledWith(expect.stringMatching('/public/locales/fr'))
      expect(props._nextI18Next.initialI18nStore)
        .toEqual({
          en: {
            common: {},
            'namespace-of-en': {},
            'namespace-of-en-US': {},
            'namespace-of-fr': {},
          },
          'en-US': {
            common: {},
            'namespace-of-en': {},
            'namespace-of-en-US': {},
            'namespace-of-fr': {},
          },
          fr: {
            common: {},
            'namespace-of-en': {},
            'namespace-of-en-US': {},
            'namespace-of-fr': {},
          },
        })
    })
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
        initialLocale: 'en-US',
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
