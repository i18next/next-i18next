import React from 'react'
import { I18nextProvider } from 'react-i18next'

import { createConfig } from './config/create-config'
import createClient from './create-client'
import { SSRConfig } from '../types'

export { I18nContext, Trans, useTranslation, withTranslation } from 'react-i18next'

type AppProps = {
  pageProps: SSRConfig;
}

export const appWithTranslation = (WrappedComponent: React.ComponentType) =>
  (props: AppProps) => {
    let i18n = null
    let locale = null

    if (props.pageProps._nextI18Next) {
      const {
        initialI18nStore,
        initialLocale,
        userConfig,
      } = props.pageProps._nextI18Next

      locale = initialLocale;
  
      ({ i18n } = createClient({
        ...createConfig(userConfig),
        lng: initialLocale,
        resources: initialI18nStore,
      }))
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
