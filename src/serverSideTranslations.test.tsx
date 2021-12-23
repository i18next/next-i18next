import React from 'react'
import fs from 'fs'
import { SSRConfig, UserConfig } from './types'
import { serverSideTranslations } from './serverSideTranslations'
import { globalI18n } from './appWithTranslation'
import { renderToString } from 'react-dom/server'
import { appWithTranslation } from './appWithTranslation'

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
}))

const DummyApp = appWithTranslation(() => (
  <div>Hello world</div>
))

const props = {
  pageProps: {
    _nextI18Next: {
      initialLocale: 'en-US',
      userConfig: {
        i18n: {
          defaultLocale: 'en',
          locales: ['en', 'fr'],
        },
      },
    },
  } as SSRConfig,
  router: {
    locale: 'en',
  },
} as any

const renderDummyComponent = () =>
  renderToString(
    <DummyApp
      {...props}
    />,
  )

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

  it('calls reloadResources when reloadOnPrerender option is true', async () => {
    renderDummyComponent()

    if (globalI18n) {
      globalI18n.reloadResources = jest.fn()
    }

    await serverSideTranslations('en-US', [], {
      i18n: {
        defaultLocale: 'en-US',
        locales: ['en-US', 'fr-CA'],
      },
      reloadOnPrerender: true,
    } as UserConfig)

    expect(globalI18n?.reloadResources).toHaveBeenCalledTimes(1)
  })

  it('does not call reloadResources when reloadOnPrerender option is false', async () => {
    renderDummyComponent()

    if (globalI18n) {
      globalI18n.reloadResources = jest.fn()
    }

    await serverSideTranslations('en-US', [], {
      i18n: {
        defaultLocale: 'en-US',
        locales: ['en-US', 'fr-CA'],
      },
      reloadOnPrerender: false,
    } as UserConfig)

    expect(globalI18n?.reloadResources).toHaveBeenCalledTimes(0)
  })

  it('throws if a function is used for localePath and namespaces are not provided', async () => {
    const localePathFn: UserConfig['localePath'] = (locale, namespace, env, missing) => `${missing}/${env}/${namespace}/${locale}.json`
    const config: UserConfig = {
      i18n: {
        defaultLocale: 'en',
        locales: ['en'],
      },
      localePath: localePathFn,
      ns: ['common'],
    }
    await expect(serverSideTranslations('en-US', undefined, config))
      .rejects.toMatchObject({ message: 'Must provide namespacesRequired to serverSideTranslations when using a function as localePath' })
  })
})
