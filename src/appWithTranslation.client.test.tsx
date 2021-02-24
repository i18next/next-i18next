import React from 'react'
import fs from 'fs'
import { screen, render } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'

import { appWithTranslation } from './appWithTranslation'

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
}))

const DummyI18nextProvider = ({ children }) => (
  <>{children}</>
)

jest.mock('react-i18next', () => ({
  I18nextProvider: jest.fn(),
  __esmodule: true,
}))


const DummyApp = appWithTranslation(() => (
  <div>Hello world</div>
))

const renderComponent = () =>
  render(
    <DummyApp
      pageProps={{
        _nextI18Next: {
          initialLocale: 'en',
          userConfig: {},
        },
      }}
    />
  )

describe('appWithTranslation', () => {
  beforeEach(() => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readdirSync as jest.Mock).mockReturnValue([]);
    (I18nextProvider as jest.Mock).mockImplementation(DummyI18nextProvider)
  })
  afterEach(jest.resetAllMocks)

  it('returns children', () => {
    renderComponent()
    expect(screen.getByText('Hello world')).toBeTruthy()
  })

  it('respects configOverride', () => {
    const DummyAppConfigOverride = appWithTranslation(() => (
      <div>Hello world</div>
    ), {
      configOverride: 'custom-value',
    } as any)
    render(
      <DummyAppConfigOverride
        pageProps={{
          _nextI18Next: {
            initialLocale: 'en',
          },
        }}
      />
    )
    const [args] = (I18nextProvider as jest.Mock).mock.calls

    expect(screen.getByText('Hello world')).toBeTruthy()
    expect(args[0].i18n.options.configOverride).toBe('custom-value')
  })

  it('throws an error if userConfig and configOverride are both missing', () => {
    const DummyAppConfigOverride = appWithTranslation(() => (
      <div>Hello world</div>
    ))
    expect(
      () => render(
        <DummyAppConfigOverride
          pageProps={{
            _nextI18Next: {
              initialLocale: 'en',
              userConfig: null,
            },
          }}
        />
      )
    ).toThrow('appWithTranslation was called without a next-i18next config')
  })

  it('returns an I18nextProvider', () => {
    renderComponent()
    expect(I18nextProvider).toHaveBeenCalledTimes(1)

    const [args] = (I18nextProvider as jest.Mock).mock.calls

    expect(I18nextProvider).toHaveBeenCalledTimes(1)
    expect(args).toHaveLength(2)
    expect(args[0].children).toBeTruthy()
    expect(args[0].i18n.addResource).toBeTruthy()
    expect(args[0].i18n.language).toEqual('en')
    expect(args[0].i18n.isInitialized).toEqual(true)

    expect(fs.existsSync).toHaveBeenCalledTimes(0)
    expect(fs.readdirSync).toHaveBeenCalledTimes(0)
  })

})
