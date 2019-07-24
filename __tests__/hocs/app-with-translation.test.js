/* eslint-env jest */
import React from 'react'

import i18next from 'i18next'
import { mount } from 'enzyme'
import NextApp, { Container } from 'next/app'

import { appWithTranslation } from '../../src/hocs'
import { localeSubpathOptions } from '../../src/config/default-config'

const mockRouterFn = jest.fn()

const defaultConfig = {
  localeSubpaths: localeSubpathOptions.NONE,
  allLanguages: ['en'],
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
    const { i18n } = await createApp()
    process.browser = true
    await i18n.changeLanguage('en')
    expect(mockRouterFn).toHaveBeenCalledTimes(1)
  })

  it('will not call router events in a server context', async () => {
    const { i18n } = await createApp()
    process.browser = false
    await i18n.changeLanguage('en')
    expect(mockRouterFn).toHaveBeenCalledTimes(0)
  })
})
