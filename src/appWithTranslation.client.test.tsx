/**
 * @jest-environment jsdom
 */

import React from 'react'
import fs from 'fs'
import { screen, render } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import createClient from './createClient'

import { appWithTranslation } from './appWithTranslation'

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

jest.mock('./createClient', () => jest.fn())

const DummyApp = appWithTranslation(() => <div>Hello world</div>, {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
  },
})

const createProps = (locale = 'en') =>
  ({
    _nextI18Next: {
      initialLocale: locale,
      userConfig: {
        i18n: {
          defaultLocale: 'en',
          locales: ['en', 'de'],
        },
      },
    } as any,
  } as any)

const defaultRenderProps = createProps()
const renderComponent = (props = defaultRenderProps) =>
  render(<DummyApp {...props} />)

describe('appWithTranslation', () => {
  beforeEach(() => {
    ;(fs.existsSync as jest.Mock).mockReturnValue(true)
    ;(fs.readdirSync as jest.Mock).mockReturnValue([])
    ;(I18nextProvider as jest.Mock).mockImplementation(
      DummyI18nextProvider
    )
    const actualCreateClient = jest.requireActual('./createClient')
    ;(createClient as jest.Mock).mockImplementation(
      actualCreateClient
    )
  })
  afterEach(jest.resetAllMocks)

  it('returns children', () => {
    renderComponent()
    expect(screen.getByText('Hello world')).toBeTruthy()
  })

  it('respects configOverride', () => {
    const DummyAppConfigOverride = appWithTranslation(
      () => <div>Hello world</div>,
      {
        configOverride: 'custom-value',
        i18n: {
          defaultLocale: 'en',
          locales: ['en', 'de'],
        },
      } as any
    )
    const customProps = {
      ...createProps(),
      _nextI18Next: {
        initialLocale: 'en',
      } as any,
    } as any
    render(<DummyAppConfigOverride {...customProps} />)
    const [args] = (I18nextProvider as jest.Mock).mock.calls

    expect(screen.getByText('Hello world')).toBeTruthy()
    expect(args[0].i18n.options.configOverride).toBe('custom-value')
  })

  it('allows passing configOverride.resources', () => {
    const DummyAppConfigOverride = appWithTranslation(
      () => <div>Hello world</div>,
      {
        i18n: {
          defaultLocale: 'en',
          locales: ['en', 'de'],
        },
        resources: {
          xyz: {
            custom: 'resources',
          },
        },
      } as any
    )
    render(<DummyAppConfigOverride {...createProps()} />)
    const [args] = (I18nextProvider as jest.Mock).mock.calls

    expect(args[0].i18n.options.resources).toMatchObject({
      xyz: {
        custom: 'resources',
      },
    })
  })

  it('throws an error if userConfig and configOverride are both missing', () => {
    const DummyAppConfigOverride = appWithTranslation(() => (
      <div>Hello world</div>
    ))
    const customProps = {
      ...createProps(),
      _nextI18Next: {
        initialLocale: 'en',
        userConfig: null,
      } as any,
    } as any
    expect(() =>
      render(<DummyAppConfigOverride {...customProps} />)
    ).toThrow(
      'appWithTranslation was called without a next-i18next config'
    )
  })

  it('throws an error if userConfig and configOverride are both missing an i18n property', () => {
    const DummyAppConfigOverride = appWithTranslation(
      () => <div>Hello world</div>,
      {} as any
    )
    const customProps = {
      ...createProps(),
      _nextI18Next: {
        initialLocale: 'en',
        userConfig: {},
      } as any,
    } as any
    expect(() =>
      render(<DummyAppConfigOverride {...customProps} />)
    ).toThrow('appWithTranslation was called without config.i18n')
  })

  it('throws an error if userConfig and configOverride are both missing a defaultLocale property', () => {
    const DummyAppConfigOverride = appWithTranslation(
      () => <div>Hello world</div>,
      { i18n: {} as any }
    )
    const customProps = {
      ...createProps(),
      _nextI18Next: {
        initialLocale: 'en',
        userConfig: { i18n: {} },
      } as any,
    } as any
    expect(() =>
      render(<DummyAppConfigOverride {...customProps} />)
    ).toThrow(
      'config.i18n does not include a defaultLocale property'
    )
  })

  it('should use the initialLocale property if the router locale is undefined', () => {
    const DummyAppConfigOverride = appWithTranslation(() => (
      <div>Hello world</div>
    ))
    const customProps = {
      ...createProps(),
      _nextI18Next: {
        initialLocale: 'en',
        userConfig: {
          i18n: {
            defaultLocale: 'fr',
          },
        },
      } as any,
    } as any

    customProps.router = {
      ...customProps.router,
      locale: undefined,
    }

    render(<DummyAppConfigOverride {...customProps} />)

    const [args] = (I18nextProvider as jest.Mock).mock.calls
    expect(args[0].i18n.language).toBe('en')
  })

  it('should use the userConfig defaltLocale property if the router locale is undefined and initialLocale is undefined', () => {
    const DummyAppConfigOverride = appWithTranslation(() => (
      <div>Hello world</div>
    ))
    const customProps = {
      ...createProps(),
        _nextI18Next: {
          initialLocale: undefined,
          userConfig: {
            i18n: {
              defaultLocale: 'fr',
            },
          },
      } as any,
    } as any

    customProps.router = {
      ...customProps.router,
      locale: undefined,
    }

    render(<DummyAppConfigOverride {...customProps} />)

    const [args] = (I18nextProvider as jest.Mock).mock.calls
    expect(args[0].i18n.language).toBe('fr')
  })

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

    expect(fs.existsSync).toHaveBeenCalledTimes(0)
    expect(fs.readdirSync).toHaveBeenCalledTimes(0)
  })

  it('should use locale from router', () => {
    renderComponent(createProps('de'))
    const [args] = (I18nextProvider as jest.Mock).mock.calls
    expect(args[0].i18n.language).toBe('de')
  })

  it('does not re-call createClient on re-renders unless locale or props have changed', () => {
    const { rerender } = renderComponent()
    expect(createClient).toHaveBeenCalledTimes(1)
    rerender(<DummyApp {...defaultRenderProps} />)
    expect(createClient).toHaveBeenCalledTimes(1)
    const newProps = createProps()
    rerender(<DummyApp {...newProps} />)
    expect(createClient).toHaveBeenCalledTimes(2)
    newProps._nextI18Next.initialLocale = 'de'
    rerender(<DummyApp {...newProps} />)
    expect(createClient).toHaveBeenCalledTimes(3)
  })

  it('assures locale key is set to the right value', () => {
    let lng = 'de'
    const props = createProps('de')

    const DummyAppWithVar = appWithTranslation(
      () => <div>language is: {lng}</div>,
      {
        i18n: {
          defaultLocale: 'en',
          locales: ['en', 'de'],
        },
      }
    )

    const { rerender } = render(<DummyAppWithVar {...props} />)

    props._nextI18Next.initialLocale = 'en'
    lng = 'en'

    rerender(<DummyAppWithVar {...props} />)
    expect(screen.getByText(`language is: ${lng}`)).toBeTruthy()

    props._nextI18Next.initialLocale = 'de'
    lng = 'de'

    rerender(<DummyAppWithVar {...createProps('de')} />)
    expect(screen.getByText(`language is: ${lng}`)).toBeTruthy()
  })
})
