import React from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import { I18nextProvider } from 'react-i18next'

import { createConfig } from './config/createConfig'
import createClient from './createClient'

import { SSRConfig, UserConfig } from '../types'

export { I18nContext, Trans, useTranslation, withTranslation } from 'react-i18next'

type AppProps = {
  pageProps: SSRConfig
}

export const appWithTranslation = (
  WrappedComponent: React.ComponentType<AppProps> | React.ElementType<AppProps>,
  configOverride: UserConfig | null = null,
) => {
  const AppWithTranslation = (props: AppProps) => {
    let i18n = null
    let locale = null

    if (props?.pageProps?._nextI18Next) {
      let { userConfig } = props.pageProps._nextI18Next
      const { initialI18nStore, initialLocale } = props.pageProps._nextI18Next

      if (userConfig === null && configOverride === null) {
        throw new Error('appWithTranslation was called without a next-i18next config')
      }

      if (configOverride !== null) {
        userConfig = configOverride
      }

      if (!userConfig?.i18n) {
        throw new Error('appWithTranslation was called without config.i18n')
      }

      locale = initialLocale;

      ({ i18n } = createClient({
        ...createConfig({
          ...userConfig,
          lng: initialLocale,
        }),
        lng: initialLocale,
        resources: initialI18nStore,
      }))
    }

    if (i18n === null) {
      throw new Error('next-i18next could not initialise an i18next client')
    }

    return (
      <I18nextProvider
        i18n={i18n}
      >
        <WrappedComponent
          key={locale}
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
