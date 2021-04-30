import React, { useMemo } from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import { I18nextProvider } from 'react-i18next'
import type { AppProps as NextJsAppProps } from 'next/app'

import { createConfig } from './config/createConfig'
import createClient from './createClient'

import { InternalConfig, SSRConfig, UserConfig } from './types'

import { i18n as I18NextClient } from 'i18next'
export { Trans, useTranslation, withTranslation } from 'react-i18next'

type AppProps = NextJsAppProps & {
  pageProps: SSRConfig
}

export let globalI18n: I18NextClient
export let globalConfig: InternalConfig

export const appWithTranslation = (
  WrappedComponent: React.ComponentType<AppProps> | React.ElementType<AppProps>,
  configOverride: UserConfig | null = null,
) => {
  const AppWithTranslation = (props: AppProps) => {
    const { _nextI18Next = {} } = props.pageProps
    let { locale } = props.router

    // Memoize the instance and only re-initialize when either:
    // 1. The route changes (non-shallowly)
    // 2. Router locale changes
    // 3. UserConfig override changes
    const {config, i18n} = useMemo(() => {
      let { userConfig } = _nextI18Next
      const { initialI18nStore } = _nextI18Next

      if (!userConfig && configOverride === null) {
        throw new Error('appWithTranslation was called without a next-i18next config')
      }

      if (configOverride !== null) {
        userConfig = configOverride
      }

      if (!userConfig?.i18n) {
        throw new Error('appWithTranslation was called without config.i18n')
      }

      if (!userConfig?.i18n?.defaultLocale) {
        throw new Error('config.i18n does not include a defaultLocale property')
      }

      if (!locale) {
        locale = userConfig.i18n.defaultLocale
      }

      const config = createConfig({
        ...userConfig,
        lng: locale,
      })

      return {
        config,
        i18n: createClient({
          ...config,
          lng: locale,
          resources: initialI18nStore,
        }).i18n}
    }, [_nextI18Next, locale, configOverride])

    globalConfig = config
    globalI18n = i18n

    return (
      <I18nextProvider
        i18n={i18n}
      >
        <WrappedComponent
          {...props}
        />
      </I18nextProvider>
    )
  }

  return hoistNonReactStatics(
    AppWithTranslation,
    WrappedComponent,
  )
}
