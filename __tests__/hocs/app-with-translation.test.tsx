import React from 'react'

import i18next from 'i18next'
import { mount } from 'enzyme'
import NextApp, { Container } from 'next/app'

import { appWithTranslation } from '../../src/hocs'
import { localeSubpathVariations } from '../config/test-helpers'

const mockRouterFn = jest.fn()

const defaultConfig = {
  localeSubpaths: localeSubpathVariations.NONE,
  allLanguages: ['en', 'de'],
  lng: 'en',
  react: {
    wait: true,
    useSuspense: false,
  },
}
const defaultProps = {
  Component: () => (
    <div>Test Page</div>
  ),
  router: {
    replace: mockRouterFn,
    pathname: '/test-path',
  },
}

const createApp = async (config = defaultConfig, props = defaultProps) => {
  const i18n = i18next.createInstance(config)
  await i18n.init()
  await i18n.changeLanguage(defaultConfig.lng)

  const appWithTranslationAndContext = appWithTranslation.bind({
    config,
    i18n,
  })
  const App = appWithTranslationAndContext(class MyApp extends NextApp {
    render() {
      const { Component, pageProps } = this.props
      return (
        <Container>
          <Component {...pageProps} />
        </Container>
      )
    }
  })

  return {
    i18n,
    tree: mount(<App {...props} />),
  }
}

describe('appWithTranslation', () => {
  beforeEach(mockRouterFn.mockReset)

  it('will call router events in a browser context', async () => {
    (process as any).browser = true
    const { i18n } = await createApp();
    (i18n as any).initializedLanguageOnce = true
    await i18n.changeLanguage('de')
    expect(mockRouterFn).toHaveBeenCalledTimes(1)
  })

  it('will not call router events in a server context', async () => {
    (process as any).browser = false
    const { i18n } = await createApp();
    (i18n as any).initializedLanguageOnce = true
    await i18n.changeLanguage('de')
    expect(mockRouterFn).toHaveBeenCalledTimes(0)
  })

  it('will not call router events if initializedLanguageOnce is false', async () => {
    const { i18n } = await createApp();
    (process as any).browser = true;
    (i18n as any).initializedLanguageOnce = false
    await i18n.changeLanguage('de')
    expect(mockRouterFn).toHaveBeenCalledTimes(0)
  })
})
