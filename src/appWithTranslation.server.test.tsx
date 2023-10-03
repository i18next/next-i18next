/**
 * @jest-environment node
 */

import React from 'react'
import fs from 'fs'
import { I18nextProvider } from 'react-i18next'
import { renderToString } from 'react-dom/server'

import { appWithTranslation } from './appWithTranslation'
import { AppProps } from 'next/app'

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
}))

interface Props {
  children: React.ReactNode
}

const DummyI18nextProvider: React.FC<Props> = ({ children }) => (
  <>{children}</>
)

jest.mock('react-i18next', () => ({
  I18nextProvider: jest.fn(),
  __esmodule: true,
}))

const MyApp = () => <div>Hello world</div>

const DummyApp = appWithTranslation(MyApp)

const props = {
    _nextI18Next: {
      initialLocale: 'en',
      userConfig: {
        i18n: {
          defaultLocale: 'en',
          locales: ['en', 'fr'],
        },
      },
  } as any,
} as any

const renderComponent = () => renderToString(<DummyApp {...props} />)

describe('appWithTranslation', () => {
  beforeEach(() => {
    ;(fs.existsSync as jest.Mock).mockReturnValue(true)
    ;(fs.readdirSync as jest.Mock).mockReturnValue([])
    ;(I18nextProvider as jest.Mock).mockImplementation(
      DummyI18nextProvider
    )
  })
  afterEach(jest.resetAllMocks)

  it('returns an I18nextProvider', () => {
    renderComponent()
    expect(I18nextProvider).toHaveBeenCalledTimes(1)

    const [args] = (I18nextProvider as jest.Mock).mock.calls

    expect(I18nextProvider).toHaveBeenCalledTimes(1)
    expect(args).toHaveLength(2)
    expect(args[0].children).toBeTruthy()
    expect(args[0].i18n.addResource).toBeTruthy()
    expect(args[0].i18n.language).toBe('en')
    expect(args[0].i18n.isInitialized).toBe(true)

    expect(fs.existsSync).toHaveBeenCalledTimes(3)
    expect(fs.readdirSync).toHaveBeenCalledTimes(1)
  })
})
