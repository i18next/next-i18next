import fs from 'fs'
import { UserConfig } from '../types'
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

  it('returns all namespaces if namespacesRequired is not provided', async () => {
    (fs.readdirSync as jest.Mock).mockReturnValue(['one', 'two', 'three'])
    const props = await serverSideTranslations('en-US', undefined, {
      i18n: {
        defaultLocale: 'en-US',
        locales: ['en-US', 'fr-CA'],
      },
    } as UserConfig)
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
