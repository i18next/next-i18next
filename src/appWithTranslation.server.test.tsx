/**
 * @jest-environment node
 */

import React from 'react'
import fs from 'fs'
import { I18nextProvider } from 'react-i18next'
import { renderToString } from 'react-dom/server'
import getConfig from 'next/config'
import { applyServerHMR } from 'i18next-hmr/server'

import { appWithTranslation } from './appWithTranslation'

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
}))

const DummyI18nextProvider: React.FC = ({ children }) => (
  <>{children}</>
)

jest.mock('react-i18next', () => ({
  I18nextProvider: jest.fn(),
  __esmodule: true,
}))

jest.mock('next/config')
jest.mock('i18next-hmr/server', () => ({
  applyServerHMR: jest.fn(),
}))

const DummyApp = appWithTranslation(() => (
  <div>Hello world</div>
))

const props = {
  pageProps: {
    _nextI18Next: {
      initialLocale: 'en',
      userConfig: {
        i18n: {
          defaultLocale: 'en',
          locales: ['en', 'fr'],
        },
      },
    },
  } as any,
} as any

const renderComponent = () =>
  renderToString(
    <DummyApp
      {...props}
    />,
  )

describe('appWithTranslation', () => {
  beforeEach(() => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readdirSync as jest.Mock).mockReturnValue([]);
    (I18nextProvider as jest.Mock).mockImplementation(DummyI18nextProvider);
    (getConfig as jest.Mock).mockReturnValue({
      publicRuntimeConfig: {},
    })
  })
  afterEach(jest.resetAllMocks)

  it('returns an I18nextProvider', () => {
    renderComponent()
    expect(I18nextProvider).toHaveBeenCalledTimes(1)

    const [args] = (I18nextProvider as jest.Mock).mock.calls

    expect(I18nextProvider).toHaveBeenCalledTimes(1)
    expect(args).toHaveLength(3)
    expect(args[0].children).toBeTruthy()
    expect(args[0].i18n.addResource).toBeTruthy()
    expect(args[0].i18n.language).toEqual('en')
    expect(args[0].i18n.isInitialized).toEqual(true)

    expect(fs.existsSync).toHaveBeenCalledTimes(1)
    expect(fs.readdirSync).toHaveBeenCalledTimes(1)
  })

  describe('When next publicRuntimeConfig.__HMR_I18N_ENABLED__ is enabled', () => {
    beforeEach(() => {
      (getConfig as jest.Mock).mockReturnValue({
        publicRuntimeConfig: {
          __HMR_I18N_ENABLED__: true,
        },
      })
    })

    it('applyServerHMR should be called', () => {
      renderComponent()
      expect(applyServerHMR).toHaveBeenCalled()
    })
  })
})
