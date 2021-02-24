import fs from 'fs'
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
    await expect(serverSideTranslations(undefined))
      .rejects
      .toThrow('Initial locale argument was not passed into serverSideTranslations')
  })

  it('returns props', async () => {
    const props = await serverSideTranslations('en')

    expect(props).toEqual({
      _nextI18Next: {
        initialI18nStore: {
          en: {},
        },
        initialLocale: 'en',
        userConfig: null,
      },
    })
  })
})
