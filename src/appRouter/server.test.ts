/**
 * @jest-environment node
 */

// We need to reset the module-level singleton between test groups
let initServerI18next: any
let getT: any
let getResources: any
let generateI18nStaticParams: any
let i18next: any

const mockInit = jest.fn().mockResolvedValue(undefined)
const mockUse = jest.fn().mockReturnThis()
const mockGetFixedT = jest.fn(() => jest.fn((key: string) => key))
const mockLoadNamespaces = jest.fn().mockResolvedValue(undefined)
const mockHasLoadedNamespace = jest.fn().mockReturnValue(true)
const mockReloadResources = jest.fn().mockResolvedValue(undefined)

const mockInstance = {
  use: mockUse,
  init: mockInit,
  getFixedT: mockGetFixedT,
  loadNamespaces: mockLoadNamespaces,
  hasLoadedNamespace: mockHasLoadedNamespace,
  reloadResources: mockReloadResources,
  language: 'en',
  isInitialized: false, // start uninitialized, init sets it to true
  options: { ns: ['common', 'home'] },
  store: {
    data: {
      en: { common: { hello: 'Hello' }, home: { title: 'Home' } },
      de: { common: { hello: 'Hallo' }, home: { title: 'Startseite' } },
    },
  },
}

jest.mock('i18next', () => ({
  createInstance: jest.fn(() => mockInstance),
  __mockInstance: mockInstance,
}))

jest.mock('react-i18next/initReactI18next', () => ({
  initReactI18next: { type: '3rdParty', init: jest.fn() },
}))

jest.mock('i18next-resources-to-backend', () => ({
  __esModule: true,
  default: jest.fn((fn: any) => ({ type: 'backend', read: fn })),
}))

jest.mock('react', () => ({
  cache: jest.fn((fn: any) => fn),
}))

jest.mock('next/headers', () => ({
  headers: jest.fn(async () => ({
    get: jest.fn((name: string) => {
      if (name === 'x-i18next-current-language') return 'en'
      return null
    }),
  })),
  cookies: jest.fn(async () => ({
    get: jest.fn(() => undefined),
  })),
}))

function resetModuleState() {
  // Reset the module to clear the module-level singleton
  jest.resetModules()

  // Re-mock after resetModules
  jest.doMock('i18next', () => ({
    createInstance: jest.fn(() => mockInstance),
    __mockInstance: mockInstance,
  }))
  jest.doMock('react-i18next/initReactI18next', () => ({
    initReactI18next: { type: '3rdParty', init: jest.fn() },
  }))
  jest.doMock('i18next-resources-to-backend', () => ({
    __esModule: true,
    default: jest.fn((fn: any) => ({ type: 'backend', read: fn })),
  }))
  jest.doMock('react', () => ({
    cache: jest.fn((fn: any) => fn),
  }))
  jest.doMock('next/headers', () => ({
    headers: jest.fn(async () => ({
      get: jest.fn((name: string) => {
        if (name === 'x-i18next-current-language') return 'en'
        return null
      }),
    })),
    cookies: jest.fn(async () => ({
      get: jest.fn(() => undefined),
    })),
  }))

  // Reset mock state
  mockInit.mockClear()
  mockUse.mockClear()
  mockGetFixedT.mockClear()
  mockLoadNamespaces.mockClear()
  mockHasLoadedNamespace.mockClear()
  mockReloadResources.mockClear()
  mockInstance.isInitialized = false

  // Make init set isInitialized to true
  mockInit.mockImplementation(async () => {
    mockInstance.isInitialized = true
  })

  // Re-import the module
  const mod = require('./server')
  initServerI18next = mod.initServerI18next
  getT = mod.getT
  getResources = mod.getResources
  generateI18nStaticParams = mod.generateI18nStaticParams
  i18next = require('i18next')
}

describe('server', () => {
  beforeEach(() => {
    resetModuleState()
  })

  describe('initServerI18next', () => {
    it('initializes the config', () => {
      initServerI18next({
        supportedLngs: ['en', 'de'],
        fallbackLng: 'en',
      })
      // Should not throw
    })
  })

  describe('getT', () => {
    it('throws when initServerI18next has not been called', async () => {
      // Do NOT call initServerI18next
      await expect(getT()).rejects.toThrow(
        'next-i18next: Server module not initialized. Call initServerI18next(config) in your root layout.'
      )
    })

    it('returns t function and i18n instance', async () => {
      initServerI18next({
        supportedLngs: ['en', 'de'],
        fallbackLng: 'en',
      })

      const result = await getT()
      expect(result).toHaveProperty('t')
      expect(result).toHaveProperty('i18n')
      expect(typeof result.t).toBe('function')
    })

    it('creates an i18next instance', async () => {
      initServerI18next({
        supportedLngs: ['en', 'de'],
        fallbackLng: 'en',
      })

      await getT()
      expect(i18next.createInstance).toHaveBeenCalledTimes(1)
    })

    it('reuses the same instance across multiple calls (singleton)', async () => {
      initServerI18next({
        supportedLngs: ['en', 'de'],
        fallbackLng: 'en',
      })

      await getT()
      await getT('home')
      await getT(['common', 'footer'])

      // Only one instance should be created across all calls
      expect(i18next.createInstance).toHaveBeenCalledTimes(1)
      expect(mockInit).toHaveBeenCalledTimes(1)
    })

    it('preloads all languages on init', async () => {
      initServerI18next({
        supportedLngs: ['en', 'de', 'fr'],
        fallbackLng: 'en',
      })

      await getT()
      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          preload: ['en', 'de', 'fr'],
        })
      )
    })

    it('passes nonExplicitSupportedLngs to i18next init', async () => {
      initServerI18next({
        supportedLngs: ['en-US', 'de-DE'],
        fallbackLng: 'en-US',
        nonExplicitSupportedLngs: true,
      })

      await getT()
      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          nonExplicitSupportedLngs: true,
        })
      )
    })

    it('defaults nonExplicitSupportedLngs to false in i18next init', async () => {
      initServerI18next({
        supportedLngs: ['en', 'de'],
        fallbackLng: 'en',
      })

      await getT()
      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          nonExplicitSupportedLngs: false,
        })
      )
    })

    it('loads additional namespaces on demand', async () => {
      mockHasLoadedNamespace.mockReturnValue(false)

      initServerI18next({
        supportedLngs: ['en', 'de'],
        fallbackLng: 'en',
      })

      await getT('extra-ns')
      expect(mockLoadNamespaces).toHaveBeenCalledWith(['extra-ns'])
    })

    it('does not reload already-loaded namespaces', async () => {
      mockHasLoadedNamespace.mockReturnValue(true)

      initServerI18next({
        supportedLngs: ['en', 'de'],
        fallbackLng: 'en',
      })

      await getT('common')
      expect(mockLoadNamespaces).not.toHaveBeenCalled()
    })

    it('calls reloadResources when reloadOnPrerender is true (dev)', async () => {
      const prevEnv = process.env.NODE_ENV
      ;(process.env as any).NODE_ENV = 'development'

      try {
        initServerI18next({
          supportedLngs: ['en', 'de'],
          fallbackLng: 'en',
          reloadOnPrerender: true,
        })

        await getT('common')
        expect(mockReloadResources).toHaveBeenCalledTimes(1)
        expect(mockReloadResources).toHaveBeenCalledWith(['en'], ['common', 'home'])
      } finally {
        ;(process.env as any).NODE_ENV = prevEnv
      }
    })

    it('does not call reloadResources when reloadOnPrerender is false', async () => {
      const prevEnv = process.env.NODE_ENV
      ;(process.env as any).NODE_ENV = 'development'

      try {
        initServerI18next({
          supportedLngs: ['en', 'de'],
          fallbackLng: 'en',
          reloadOnPrerender: false,
        })

        await getT('common')
        expect(mockReloadResources).not.toHaveBeenCalled()
      } finally {
        ;(process.env as any).NODE_ENV = prevEnv
      }
    })

    it('does not call reloadResources in production even when reloadOnPrerender is true', async () => {
      const prevEnv = process.env.NODE_ENV
      ;(process.env as any).NODE_ENV = 'production'

      try {
        initServerI18next({
          supportedLngs: ['en', 'de'],
          fallbackLng: 'en',
          reloadOnPrerender: true,
        })

        await getT('common')
        expect(mockReloadResources).not.toHaveBeenCalled()
      } finally {
        ;(process.env as any).NODE_ENV = prevEnv
      }
    })

    it('does not add default backend when custom backend is provided', async () => {
      const resourcesToBackend = require('i18next-resources-to-backend').default
      resourcesToBackend.mockClear()

      const customBackend = { type: 'backend', init: jest.fn(), read: jest.fn() }
      initServerI18next({
        supportedLngs: ['en', 'de'],
        fallbackLng: 'en',
        use: [customBackend],
      })

      await getT()
      expect(resourcesToBackend).not.toHaveBeenCalled()
    })

    it('respects lng option for getFixedT', async () => {
      initServerI18next({
        supportedLngs: ['en', 'de'],
        fallbackLng: 'en',
      })

      await getT('common', { lng: 'de' })
      expect(mockGetFixedT).toHaveBeenCalledWith('de', 'common', undefined)
    })

    it('detects language from cookie when header is not set', async () => {
      // Re-setup with no header but a valid cookie
      jest.resetModules()
      jest.doMock('i18next', () => ({
        createInstance: jest.fn(() => mockInstance),
      }))
      jest.doMock('react-i18next/initReactI18next', () => ({
        initReactI18next: { type: '3rdParty', init: jest.fn() },
      }))
      jest.doMock('i18next-resources-to-backend', () => ({
        __esModule: true,
        default: jest.fn((fn: any) => ({ type: 'backend', read: fn })),
      }))
      jest.doMock('react', () => ({
        cache: jest.fn((fn: any) => fn),
      }))
      jest.doMock('next/headers', () => ({
        headers: jest.fn(async () => ({
          get: jest.fn(() => null), // no header
        })),
        cookies: jest.fn(async () => ({
          get: jest.fn((name: string) => {
            if (name === 'i18next') return { value: 'de' }
            return undefined
          }),
        })),
      }))

      mockInit.mockClear()
      mockGetFixedT.mockClear()
      mockInstance.isInitialized = false
      mockInit.mockImplementation(async () => {
        mockInstance.isInitialized = true
      })

      const mod = require('./server')
      mod.initServerI18next({
        supportedLngs: ['en', 'de'],
        fallbackLng: 'en',
      })

      await mod.getT()
      expect(mockGetFixedT).toHaveBeenCalledWith('de', 'common', undefined)
    })

    it('falls back to fallbackLng when no header and no valid cookie', async () => {
      jest.resetModules()
      jest.doMock('i18next', () => ({
        createInstance: jest.fn(() => mockInstance),
      }))
      jest.doMock('react-i18next/initReactI18next', () => ({
        initReactI18next: { type: '3rdParty', init: jest.fn() },
      }))
      jest.doMock('i18next-resources-to-backend', () => ({
        __esModule: true,
        default: jest.fn((fn: any) => ({ type: 'backend', read: fn })),
      }))
      jest.doMock('react', () => ({
        cache: jest.fn((fn: any) => fn),
      }))
      jest.doMock('next/headers', () => ({
        headers: jest.fn(async () => ({
          get: jest.fn(() => null), // no header
        })),
        cookies: jest.fn(async () => ({
          get: jest.fn(() => undefined), // no cookie
        })),
      }))

      mockInit.mockClear()
      mockGetFixedT.mockClear()
      mockInstance.isInitialized = false
      mockInit.mockImplementation(async () => {
        mockInstance.isInitialized = true
      })

      const mod = require('./server')
      mod.initServerI18next({
        supportedLngs: ['en', 'de'],
        fallbackLng: 'en',
      })

      await mod.getT()
      expect(mockGetFixedT).toHaveBeenCalledWith('en', 'common', undefined)
    })

    it('ignores cookie value that is not in supported languages', async () => {
      jest.resetModules()
      jest.doMock('i18next', () => ({
        createInstance: jest.fn(() => mockInstance),
      }))
      jest.doMock('react-i18next/initReactI18next', () => ({
        initReactI18next: { type: '3rdParty', init: jest.fn() },
      }))
      jest.doMock('i18next-resources-to-backend', () => ({
        __esModule: true,
        default: jest.fn((fn: any) => ({ type: 'backend', read: fn })),
      }))
      jest.doMock('react', () => ({
        cache: jest.fn((fn: any) => fn),
      }))
      jest.doMock('next/headers', () => ({
        headers: jest.fn(async () => ({
          get: jest.fn(() => null),
        })),
        cookies: jest.fn(async () => ({
          get: jest.fn((name: string) => {
            if (name === 'i18next') return { value: 'xx' } // unsupported language
            return undefined
          }),
        })),
      }))

      mockInit.mockClear()
      mockGetFixedT.mockClear()
      mockInstance.isInitialized = false
      mockInit.mockImplementation(async () => {
        mockInstance.isInitialized = true
      })

      const mod = require('./server')
      mod.initServerI18next({
        supportedLngs: ['en', 'de'],
        fallbackLng: 'en',
      })

      await mod.getT()
      // Should fall back to default language since 'xx' is not supported
      expect(mockGetFixedT).toHaveBeenCalledWith('en', 'common', undefined)
    })

    it('detects language from cookie with nonExplicitSupportedLngs (en -> en-US)', async () => {
      jest.resetModules()
      jest.doMock('i18next', () => ({
        createInstance: jest.fn(() => mockInstance),
      }))
      jest.doMock('react-i18next/initReactI18next', () => ({
        initReactI18next: { type: '3rdParty', init: jest.fn() },
      }))
      jest.doMock('i18next-resources-to-backend', () => ({
        __esModule: true,
        default: jest.fn((fn: any) => ({ type: 'backend', read: fn })),
      }))
      jest.doMock('react', () => ({
        cache: jest.fn((fn: any) => fn),
      }))
      jest.doMock('next/headers', () => ({
        headers: jest.fn(async () => ({
          get: jest.fn(() => null), // no header
        })),
        cookies: jest.fn(async () => ({
          get: jest.fn((name: string) => {
            if (name === 'i18next') return { value: 'en' } // base language, not in supportedLngs
            return undefined
          }),
        })),
      }))

      mockInit.mockClear()
      mockGetFixedT.mockClear()
      mockInstance.isInitialized = false
      mockInit.mockImplementation(async () => {
        mockInstance.isInitialized = true
      })

      const mod = require('./server')
      mod.initServerI18next({
        supportedLngs: ['en-US', 'en-GB', 'de-DE'],
        fallbackLng: 'en-US',
        nonExplicitSupportedLngs: true,
      })

      await mod.getT()
      // Should match 'en' to 'en-US' via nonExplicitSupportedLngs
      expect(mockGetFixedT).toHaveBeenCalledWith('en-US', 'common', undefined)
    })

    it('uses custom resourceLoader when provided', async () => {
      const resourcesToBackend = require('i18next-resources-to-backend').default
      resourcesToBackend.mockClear()

      const customLoader = jest.fn()
      initServerI18next({
        supportedLngs: ['en', 'de'],
        fallbackLng: 'en',
        resourceLoader: customLoader,
      })

      await getT()
      expect(resourcesToBackend).toHaveBeenCalledWith(customLoader)
    })

    it('respects keyPrefix option', async () => {
      initServerI18next({
        supportedLngs: ['en', 'de'],
        fallbackLng: 'en',
      })

      await getT('common', { keyPrefix: 'nested' })
      expect(mockGetFixedT).toHaveBeenCalledWith('en', 'common', 'nested')
    })
  })

  describe('getResources', () => {
    it('extracts all resources from store', () => {
      const resources = getResources(mockInstance as any)
      expect(resources).toEqual({
        en: { common: { hello: 'Hello' }, home: { title: 'Home' } },
        de: { common: { hello: 'Hallo' }, home: { title: 'Startseite' } },
      })
    })

    it('filters by namespace when specified', () => {
      const resources = getResources(mockInstance as any, ['common'])
      expect(resources).toEqual({
        en: { common: { hello: 'Hello' } },
        de: { common: { hello: 'Hallo' } },
      })
    })

    it('returns empty object when store is empty', () => {
      const mockI18n = { store: { data: {} } } as any
      const resources = getResources(mockI18n)
      expect(resources).toEqual({})
    })
  })

  describe('generateI18nStaticParams', () => {
    it('returns params for all languages', () => {
      initServerI18next({
        supportedLngs: ['en', 'de', 'fr'],
        fallbackLng: 'en',
      })

      const params = generateI18nStaticParams()
      expect(params).toEqual([
        { lng: 'en' },
        { lng: 'de' },
        { lng: 'fr' },
      ])
    })
  })
})
