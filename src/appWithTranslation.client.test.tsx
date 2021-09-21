import React from 'react'
import fs from 'fs'
import { screen, render } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import createClient from './createClient'

import { appWithTranslation } from './appWithTranslation'
import { NextRouter } from 'next/router'

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

jest.mock('./createClient', () => jest.fn())

const DummyApp = appWithTranslation(() => (
  <div>Hello world</div>
))

const createProps = (locale = 'en', router: Partial<NextRouter> = {}) => ({
  pageProps: {
    _nextI18Next: {
      initialLocale: locale,
      userConfig: {
        i18n: {
          defaultLocale: 'en',
          locales: ['en', 'de'],
        },
      },
    },
  } as any,
  router: {
    locale: locale,
    route: '/',
    ...router,
  },
} as any)

const defaultRenderProps = createProps()
const renderComponent = (props = defaultRenderProps) =>
  render(
    <DummyApp
      {...props}
    />
  )

describe('appWithTranslation', () => {
  beforeEach(() => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readdirSync as jest.Mock).mockReturnValue([]);
    (I18nextProvider as jest.Mock).mockImplementation(DummyI18nextProvider)
    const actualCreateClient = jest.requireActual('./createClient');
    (createClient as jest.Mock).mockImplementation(actualCreateClient)
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
      i18n: {
        defaultLocale: 'en',
        locales: ['en', 'de'],
      },
    } as any)
    const customProps = {
      ...createProps(),
      pageProps: {
        _nextI18Next: {
          initialLocale: 'en',
        },
      } as any,
    } as any
    render(
      <DummyAppConfigOverride
        {...customProps}
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
    const customProps = {
      ...createProps(),
      pageProps: {
        _nextI18Next: {
          initialLocale: 'en',
          userConfig: null,
        },
      } as any,
    } as any
    expect(
      () => render(
        <DummyAppConfigOverride
          {...customProps}
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

  it('should use locale from router', () => {
    renderComponent(createProps('de'))
    const [args] = (I18nextProvider as jest.Mock).mock.calls
    expect(args[0].i18n.language).toEqual('de')
  })

  it('does not re-call createClient on re-renders unless locale or props have changed', () => {
    const { rerender } = renderComponent()
    expect(createClient).toHaveBeenCalledTimes(1)
    rerender(
      <DummyApp
        {...defaultRenderProps}
      />
    )
    expect(createClient).toHaveBeenCalledTimes(1)
    const newProps = createProps()
    rerender(
      <DummyApp
        {...newProps}
      />
    )
    expect(createClient).toHaveBeenCalledTimes(2)
    newProps.router.locale = 'de'
    rerender(
      <DummyApp
        {...newProps}
      />
    )
    expect(createClient).toHaveBeenCalledTimes(3)
  })

})
