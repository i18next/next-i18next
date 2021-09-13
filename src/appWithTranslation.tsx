import React, { useMemo } from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import { I18nextProvider } from 'react-i18next'
import type { AppProps as NextJsAppProps } from 'next/app'

import { createConfig } from './config/createConfig'
import createClient from './createClient'

import { SSRConfig, UserConfig } from './types'

import { i18n as I18NextClient } from 'i18next'
export { Trans, useTranslation, withTranslation } from 'react-i18next'

type AppProps = NextJsAppProps & {
  pageProps: SSRConfig
}

export let globalI18n: I18NextClient | null = null

export const appWithTranslation = (
  WrappedComponent: React.ComponentType<AppProps> | React.ElementType<AppProps>,
  configOverride: UserConfig | null = null,
) => {
  const AppWithTranslation = (props: AppProps) => {
    const { _nextI18Next } = props.pageProps
    const { locale } = props.router

    // Memoize the instance and only re-initialize when either:
    // 1. The route changes (non-shallowly)
    // 2. Router locale changes
    const i18n: I18NextClient | null = useMemo(() => {
      if (!locale || !_nextI18Next) return null

      let { userConfig } = _nextI18Next
      const { initialI18nStore } = _nextI18Next

      if (userConfig === null && configOverride === null) {
        throw new Error('appWithTranslation was called without a next-i18next config')
      }

      if (configOverride !== null) {
        userConfig = configOverride
      }

      if (!userConfig?.i18n) {
        throw new Error('appWithTranslation was called without config.i18n')
      }


      const instance = createClient({
        ...createConfig({
          ...userConfig,
          lng: locale,
        }),
        lng: locale,
        resources: initialI18nStore,
      }).i18n

      globalI18n = instance

      return instance
    }, [_nextI18Next, locale])

    return i18n !== null ? (
      <I18nextProvider
        i18n={i18n}
      >
        <WrappedComponent
          key={locale}
          {...props}
        />
      </I18nextProvider>
    ) : (
      <WrappedComponent
        key={locale}
        {...props}
      />
    )
  }

  return hoistNonReactStatics(
    AppWithTranslation,
    WrappedComponent,
  )
}
