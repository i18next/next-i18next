/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, act, screen, waitFor } from '@testing-library/react'

// ── mocks ────────────────────────────────────────────────────────────────────

const mockChangeLanguage = jest.fn().mockResolvedValue(undefined)
const mockInit = jest.fn().mockReturnValue(Promise.resolve())
const mockUse = jest.fn().mockReturnThis()

jest.mock('i18next', () => {
  const instance = {
    use: (...args: any[]) => mockUse(...args),
    init: (...args: any[]) => mockInit(...args),
    changeLanguage: (...args: any[]) => mockChangeLanguage(...args),
    language: 'en',
    resolvedLanguage: 'en',
    isInitialized: true,
    store: { data: { en: { common: { hello: 'Hello' } } } },
    getFixedT: jest.fn(() => (key: string) => key),
    on: jest.fn(),
    off: jest.fn(),
    t: jest.fn((key: string) => key),
    services: { resourceStore: { data: {} } },
    options: {},
    hasLoadedNamespace: jest.fn().mockReturnValue(true),
    loadNamespaces: jest.fn().mockResolvedValue(undefined),
  }
  return {
    createInstance: jest.fn(() => instance),
    __mockInstance: instance,
  }
})

jest.mock('react-i18next/initReactI18next', () => ({
  initReactI18next: { type: '3rdParty', init: jest.fn() },
}))

jest.mock('i18next-resources-to-backend', () => ({
  __esModule: true,
  default: jest.fn((fn: any) => ({ type: 'backend', read: fn })),
}))

// Track router.refresh calls
const mockRefresh = jest.fn()
const mockParams: Record<string, any> = { lng: 'en' }

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => mockParams),
  useRouter: jest.fn(() => ({
    refresh: mockRefresh,
    push: jest.fn(),
    replace: jest.fn(),
  })),
}))

jest.mock('react-i18next', () => {
  const actualReact = jest.requireActual('react')
  const { __mockInstance } = jest.requireActual('i18next') as any
  // Fallback: if requireActual doesn't have our mock, use a plain object
  const i18nForContext = __mockInstance || { language: 'en' }
  const I18nContext = actualReact.createContext({ i18n: i18nForContext, t: (key: string) => key })

  return {
    I18nextProvider: ({ children }: any) => {
      return actualReact.createElement('div', null, children)
    },
    useTranslation: jest.fn(() => ({
      t: (key: string) => key,
      i18n: require('i18next').__mockInstance,
      ready: true,
    })),
    Trans: ({ i18nKey }: any) => actualReact.createElement('span', null, i18nKey),
    I18nContext,
  }
})

import { I18nProvider, useT, useChangeLanguage } from './client'

// ── helpers ──────────────────────────────────────────────────────────────────

function getMockInstance() {
  return require('i18next').__mockInstance
}

function renderProvider(props: Partial<React.ComponentProps<typeof I18nProvider>> = {}) {
  return render(
    <I18nProvider
      language='en'
      resources={{ en: { common: { hello: 'Hello' } } }}
      {...props}
    >
      <div data-testid='child'>child content</div>
    </I18nProvider>,
  )
}

// ── tests ────────────────────────────────────────────────────────────────────

describe('I18nProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const inst = getMockInstance()
    inst.language = 'en'
    inst.resolvedLanguage = 'en'
  })

  it('renders children', () => {
    renderProvider()
    expect(screen.getByTestId('child').textContent).toBe('child content')
  })

  it('creates an i18next instance with correct config', () => {
    const { createInstance } = require('i18next')
    createInstance.mockClear()

    renderProvider({
      language: 'de',
      resources: { de: { common: { hello: 'Hallo' } } },
      defaultNS: 'common',
      fallbackLng: 'en',
      supportedLngs: ['en', 'de'],
    })

    expect(createInstance).toHaveBeenCalledTimes(1)
    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({
        lng: 'de',
        defaultNS: 'common',
        fallbackLng: 'en',
        supportedLngs: ['en', 'de'],
        partialBundledLanguages: false, // false when resources are provided without custom backend
      }),
    )
  })

  it('uses the default fetch backend when no custom backend is provided', () => {
    const resourcesToBackend = require('i18next-resources-to-backend').default
    resourcesToBackend.mockClear()
    mockUse.mockClear()

    renderProvider()

    expect(resourcesToBackend).toHaveBeenCalledTimes(1)
    expect(mockUse).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'backend' }),
    )
  })

  it('skips default backend when custom backend is provided via use prop', () => {
    const resourcesToBackend = require('i18next-resources-to-backend').default
    resourcesToBackend.mockClear()

    const customBackend = { type: 'backend' as const, init: jest.fn(), read: jest.fn() }
    renderProvider({ use: [customBackend] })

    expect(resourcesToBackend).not.toHaveBeenCalled()
    expect(mockUse).toHaveBeenCalledWith(customBackend)
  })

  it('applies user-provided plugins', () => {
    mockUse.mockClear()
    const customPlugin = { type: 'postProcessor' as const, name: 'test', process: jest.fn() }
    renderProvider({ use: [customPlugin] })

    expect(mockUse).toHaveBeenCalledWith(customPlugin)
  })

  it('calls changeLanguage when language prop changes', async () => {
    const inst = getMockInstance()
    inst.language = 'en'

    const { rerender } = render(
      <I18nProvider language='en' resources={{ en: { common: {} } }}>
        <div>child</div>
      </I18nProvider>,
    )

    mockChangeLanguage.mockClear()

    rerender(
      <I18nProvider language='de' resources={{ en: { common: {} } }}>
        <div>child</div>
      </I18nProvider>,
    )

    await waitFor(() => {
      expect(mockChangeLanguage).toHaveBeenCalledWith('de')
    })
  })

  it('does not call changeLanguage when language has not changed', () => {
    const inst = getMockInstance()
    inst.language = 'en'
    mockChangeLanguage.mockClear()

    renderProvider({ language: 'en' })

    expect(mockChangeLanguage).not.toHaveBeenCalled()
  })

  it('uses language as fallbackLng when fallbackLng is not provided', () => {
    renderProvider({ language: 'fr' })

    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({ fallbackLng: 'fr' }),
    )
  })

  it('passes additional i18nextOptions to init', () => {
    renderProvider({
      i18nextOptions: {
        debug: true,
        backend: { loadPath: '/api/translations/{{lng}}/{{ns}}' },
      },
    })

    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({
        debug: true,
        backend: { loadPath: '/api/translations/{{lng}}/{{ns}}' },
      }),
    )
  })

  it('derives supportedLngs from resources keys when supportedLngs is not provided', () => {
    renderProvider({
      resources: { en: { common: {} }, de: { common: {} } },
      supportedLngs: undefined,
    })

    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({
        supportedLngs: ['en', 'de'],
      }),
    )
  })

  it('falls back to [language] when no resources and no supportedLngs provided', () => {
    renderProvider({
      resources: undefined,
      supportedLngs: undefined,
      language: 'ja',
    })

    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({
        supportedLngs: ['ja'],
      }),
    )
  })
})

describe('useT', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const inst = getMockInstance()
    inst.resolvedLanguage = 'en'
    mockParams.lng = 'en'
  })

  function TestComponent({ ns }: { ns?: string }) {
    const { t } = useT(ns)
    return <span data-testid='translated'>{t('key')}</span>
  }

  it('returns a translation function', () => {
    render(
      <I18nProvider language='en' resources={{ en: { common: {} } }}>
        <TestComponent />
      </I18nProvider>,
    )
    expect(screen.getByTestId('translated')).toBeTruthy()
  })

  it('calls useTranslation with the given namespace', () => {
    const { useTranslation } = require('react-i18next')
    useTranslation.mockClear()

    render(
      <I18nProvider language='en' resources={{ en: { common: {} } }}>
        <TestComponent ns='home' />
      </I18nProvider>,
    )

    expect(useTranslation).toHaveBeenCalledWith('home', undefined)
  })

  it('syncs language from URL params when different from resolved', async () => {
    const inst = getMockInstance()
    mockParams.lng = 'de'
    inst.resolvedLanguage = 'en'
    mockChangeLanguage.mockClear()

    render(
      <I18nProvider language='en' resources={{ en: { common: {} } }}>
        <TestComponent />
      </I18nProvider>,
    )

    await waitFor(() => {
      expect(mockChangeLanguage).toHaveBeenCalledWith('de')
    })
  })

  it('does not sync language when URL params match resolved language', () => {
    const inst = getMockInstance()
    mockParams.lng = 'en'
    inst.resolvedLanguage = 'en'
    mockChangeLanguage.mockClear()

    render(
      <I18nProvider language='en' resources={{ en: { common: {} } }}>
        <TestComponent />
      </I18nProvider>,
    )

    expect(mockChangeLanguage).not.toHaveBeenCalled()
  })

  it('handles missing lng param gracefully (no-locale-path mode)', () => {
    mockParams.lng = undefined
    delete mockParams.locale
    mockChangeLanguage.mockClear()

    render(
      <I18nProvider language='en' resources={{ en: { common: {} } }}>
        <TestComponent />
      </I18nProvider>,
    )

    expect(mockChangeLanguage).not.toHaveBeenCalled()
  })

  it('reads language from [locale] param when [lng] is not present', async () => {
    const inst = getMockInstance()
    delete mockParams.lng
    mockParams.locale = 'fr'
    inst.resolvedLanguage = 'en'
    mockChangeLanguage.mockClear()

    render(
      <I18nProvider language='en' resources={{ en: { common: {} } }}>
        <TestComponent />
      </I18nProvider>,
    )

    await waitFor(() => {
      expect(mockChangeLanguage).toHaveBeenCalledWith('fr')
    })
  })

  it('prefers [lng] param over [locale] param when both present', async () => {
    const inst = getMockInstance()
    mockParams.lng = 'de'
    mockParams.locale = 'fr'
    inst.resolvedLanguage = 'en'
    mockChangeLanguage.mockClear()

    render(
      <I18nProvider language='en' resources={{ en: { common: {} } }}>
        <TestComponent />
      </I18nProvider>,
    )

    await waitFor(() => {
      expect(mockChangeLanguage).toHaveBeenCalledWith('de')
    })
  })
})

describe('useChangeLanguage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    })
  })

  function LanguageSwitcher({ cookieName }: { cookieName?: string }) {
    const changeLanguage = useChangeLanguage(cookieName)
    return (
      <button
        data-testid='switch'
        onClick={() => changeLanguage('de')}
      >
        Switch
      </button>
    )
  }

  it('sets cookie, changes language, and refreshes router', async () => {
    render(
      <I18nProvider language='en' resources={{ en: { common: {} } }}>
        <LanguageSwitcher />
      </I18nProvider>,
    )

    await act(async () => {
      screen.getByTestId('switch').click()
    })

    expect(document.cookie).toContain('i18next=de')
    expect(document.cookie).toContain('path=/')
    expect(document.cookie).toContain('SameSite=Lax')
    expect(mockChangeLanguage).toHaveBeenCalledWith('de')
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  it('uses custom cookie name when provided', async () => {
    render(
      <I18nProvider language='en' resources={{ en: { common: {} } }}>
        <LanguageSwitcher cookieName='my_lang' />
      </I18nProvider>,
    )

    await act(async () => {
      screen.getByTestId('switch').click()
    })

    expect(document.cookie).toContain('my_lang=de')
  })
})

describe('Trans re-export', () => {
  it('is exported from the client module', () => {
    const clientModule = require('./client')
    expect(clientModule.Trans).toBeDefined()
  })
})
