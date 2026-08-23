/**
 * @jest-environment node
 */

// The App Router renders Client Components on the server too, once per request.
// A backend attached there would run in Node on every render — see the comment
// in client.tsx. These tests pin that behaviour down.

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const mockInit = jest.fn().mockReturnValue(Promise.resolve())
const mockUse = jest.fn().mockReturnThis()

jest.mock('i18next', () => {
  const instance = {
    use: (...args: any[]) => mockUse(...args),
    init: (...args: any[]) => mockInit(...args),
    changeLanguage: jest.fn().mockResolvedValue(undefined),
    language: 'en',
    resolvedLanguage: 'en',
    isInitialized: true,
    store: { data: {} },
    on: jest.fn(),
    off: jest.fn(),
    options: {},
  }
  return { createInstance: jest.fn(() => instance), __mockInstance: instance }
})

jest.mock('react-i18next/initReactI18next', () => ({
  initReactI18next: { type: '3rdParty', init: jest.fn() },
}))

jest.mock('i18next-resources-to-backend', () => ({
  __esModule: true,
  default: jest.fn((fn: any) => ({ type: 'backend', read: fn })),
}))

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ lng: 'en' })),
  useRouter: jest.fn(() => ({ refresh: jest.fn(), push: jest.fn(), replace: jest.fn() })),
}))

jest.mock('react-i18next', () => {
  const actualReact = jest.requireActual('react')
  return {
    I18nextProvider: ({ children }: any) => actualReact.createElement('div', null, children),
    useTranslation: jest.fn(() => ({ t: (key: string) => key, i18n: {}, ready: true })),
    Trans: ({ i18nKey }: any) => actualReact.createElement('span', null, i18nKey),
    I18nContext: actualReact.createContext({}),
  }
})

import { I18nProvider } from './client'

const resources = { en: { common: { hello: 'Hello' } } }

function renderSSR(props: Partial<React.ComponentProps<typeof I18nProvider>> = {}) {
  return renderToStaticMarkup(
    <I18nProvider language='en' resources={resources} {...props}>
      <span>child content</span>
    </I18nProvider>,
  )
}

describe('I18nProvider on the server', () => {
  beforeEach(() => jest.clearAllMocks())

  it('does not apply a custom backend during SSR', () => {
    const customBackend = { type: 'backend' as const, init: jest.fn(), read: jest.fn() }

    const html = renderSSR({ use: [customBackend] })

    expect(html).toContain('child content')
    expect(mockUse).not.toHaveBeenCalledWith(customBackend)
  })

  it('does not add the default fetch backend during SSR', () => {
    const resourcesToBackend = require('i18next-resources-to-backend').default

    renderSSR()

    expect(resourcesToBackend).not.toHaveBeenCalled()
    expect(mockUse).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'backend' }))
  })

  it('still applies non-backend plugins during SSR', () => {
    const postProcessor = { type: 'postProcessor' as const, name: 'test', process: jest.fn() }

    renderSSR({ use: [postProcessor] })

    expect(mockUse).toHaveBeenCalledWith(postProcessor)
  })

  it('renders from resources with partialBundledLanguages off', () => {
    const customBackend = { type: 'backend' as const, init: jest.fn(), read: jest.fn() }

    renderSSR({ use: [customBackend] })

    expect(mockInit).toHaveBeenCalledWith(
      expect.objectContaining({ resources, partialBundledLanguages: false }),
    )
  })
})
