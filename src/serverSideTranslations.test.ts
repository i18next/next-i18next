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
      expect(fs.readdirSync).toHaveBeenCalledTimes(2)
      expect(fs.readdirSync).toHaveBeenCalledWith(expect.stringMatching('/public/locales/en-US'))
      expect(fs.readdirSync).toHaveBeenCalledWith(expect.stringMatching('/public/locales/fr-CA'))
      expect(props._nextI18Next.initialI18nStore)
        .toEqual({
          'en-US': {
            common: {},
            'namespace-of-en-US': {},
            'namespace-of-fr-CA': {},
          },
          'fr-CA': {
            common: {},
            'namespace-of-en-US': {},
            'namespace-of-fr-CA': {},
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
      expect(fs.readdirSync).toHaveBeenCalledTimes(3)
      expect(fs.readdirSync).toHaveBeenCalledWith(expect.stringMatching('/public/locales/nl-BE'))
      expect(fs.readdirSync).toHaveBeenCalledWith(expect.stringMatching('/public/locales/fr-BE'))
      expect(fs.readdirSync).toHaveBeenCalledWith(expect.stringMatching('/public/locales/fr'))
      expect(props._nextI18Next.initialI18nStore)
        .toEqual({
          fr: {
            common: {},
            'namespace-of-fr': {},
            'namespace-of-fr-BE': {},
            'namespace-of-nl-BE': {},
          },
          'fr-BE': {
            common: {},
            'namespace-of-fr': {},
            'namespace-of-fr-BE': {},
            'namespace-of-nl-BE': {},
          },
          'nl-BE': {
            common: {},
            'namespace-of-fr': {},
            'namespace-of-fr-BE': {},
            'namespace-of-nl-BE': {},
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
      expect(fs.readdirSync).toHaveBeenCalledTimes(4)
      expect(fs.readdirSync).toHaveBeenCalledWith(expect.stringMatching('/public/locales/fr-CA'))
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
            'namespace-of-fr-CA': {},
          },
          'en-US': {
            common: {},
            'namespace-of-en': {},
            'namespace-of-en-US': {},
            'namespace-of-fr': {},
            'namespace-of-fr-CA': {},
          },
          fr: {
            common: {},
            'namespace-of-en': {},
            'namespace-of-en-US': {},
            'namespace-of-fr': {},
            'namespace-of-fr-CA': {},
          },
          'fr-CA': {
            common: {},
            'namespace-of-en': {},
            'namespace-of-en-US': {},
            'namespace-of-fr': {},
            'namespace-of-fr-CA': {},
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
      expect(fs.readdirSync).toHaveBeenCalledTimes(4)
      expect(fs.readdirSync).toHaveBeenCalledWith(expect.stringMatching('/public/locales/fr-BE'))
      expect(fs.readdirSync).toHaveBeenCalledWith(expect.stringMatching('/public/locales/nl-BE'))
      expect(fs.readdirSync).toHaveBeenCalledWith(expect.stringMatching('/public/locales/en'))
      expect(fs.readdirSync).toHaveBeenCalledWith(expect.stringMatching('/public/locales/fr'))
      expect(props._nextI18Next.initialI18nStore)
        .toEqual({
          en: {
            common: {},
            'namespace-of-en': {},
            'namespace-of-fr': {},
            'namespace-of-fr-BE': {},
            'namespace-of-nl-BE': {},
          },
          fr: {
            common: {},
            'namespace-of-en': {},
            'namespace-of-fr': {},
            'namespace-of-fr-BE': {},
            'namespace-of-nl-BE': {},
          },
          'fr-BE': {
            common: {},
            'namespace-of-en': {},
            'namespace-of-fr': {},
            'namespace-of-fr-BE': {},
            'namespace-of-nl-BE': {},
          },
          'nl-BE': {
            common: {},
            'namespace-of-en': {},
            'namespace-of-fr': {},
            'namespace-of-fr-BE': {},
            'namespace-of-nl-BE': {},
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
          'fr-CA': {},
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
