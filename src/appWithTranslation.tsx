import React, { useEffect, useMemo } from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import { I18nextProvider } from 'react-i18next'
import getConfig from 'next/config'
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
    let i18n: I18NextClient | null = null
    let locale = null

    if (props?.pageProps?._nextI18Next) {
      let { userConfig } = props.pageProps._nextI18Next
      const { initialI18nStore, initialLocale } = props.pageProps._nextI18Next
      const nextRuntimeConfig = getConfig()?.publicRuntimeConfig

      if (userConfig === null && configOverride === null) {
        throw new Error('appWithTranslation was called without a next-i18next config')
      }

      if (configOverride !== null) {
        userConfig = configOverride
      }

      if (!userConfig?.i18n) {
        throw new Error('appWithTranslation was called without config.i18n')
      }

      locale = initialLocale

      // preload namespace when hmr is enabled
      // use `i18next-http-backend` when hmr is enabled
      if (
        process.env.NODE_ENV !== 'production' &&
        nextRuntimeConfig?.__HMR_I18N_ENABLED__ &&
        typeof window !== 'undefined'
      ) {
        userConfig = {
          ...userConfig,
          ns: userConfig.ns || nextRuntimeConfig?.__HMR_I18N_NAMESPACES__,
          use: [
            ...userConfig.use || [],
            require('i18next-http-backend').default,
          ],
        }
      }

      ({ i18n } = createClient({
        ...createConfig({
          ...userConfig,
          lng: initialLocale,
        }),
        lng: initialLocale,
        resources: initialI18nStore,
      }))

      if (process.env.NODE_ENV !== 'production' && nextRuntimeConfig?.__HMR_I18N_ENABLED__) {
        if (typeof window === 'undefined') {
          const { applyServerHMR } = require('i18next-hmr/server')
          applyServerHMR(i18n)
        } else {
          useEffect(() => {
            const emitLanguageChange = () => {
              i18n?.emit('languageChanged')
            }
            const { applyClientHMR } = require('i18next-hmr/client')
            applyClientHMR(i18n)
            i18n?.on('loaded', emitLanguageChange)
            return () => {
              i18n?.off('loaded', emitLanguageChange)
            }
          }, [i18n])
        }
      }

      useMemo(() => {
        globalI18n = i18n
      }, [i18n])
    }

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
