
import React from 'react'
import { I18nextProvider } from 'react-i18next'

import { createConfig } from './config/create-config'
import createClient from './create-client'
import { Config, InitConfig } from '../types'

export {
  I18nContext,
  Trans,
  useTranslation,
  withTranslation,
} from 'react-i18next'

type SSRConfig = {
  _nextI18Next: {
    initialI18nStore: any;
    initialLocale: string;
    userConfig: InitConfig;
  };
}

type AppProps = {
  pageProps: SSRConfig;
}

export const serverSideTranslations = async (
  initialLocale: string,
  userConfig: Config,
  namespacesRequired: string[] = []
): Promise<SSRConfig> => {

  const config = createConfig(userConfig)
  const { i18n, initPromise } = createClient({
    ...config,
    lng: initialLocale,
  })
  await initPromise

  const initialI18nStore = {
    [initialLocale]: {}
  }

  namespacesRequired.forEach((ns) => {
    initialI18nStore[initialLocale][ns] = (
      (i18n.services.resourceStore.data[initialLocale] || {})[ns] || {}
    )
  })

  return {
    _nextI18Next: {
      initialI18nStore,
      initialLocale,
      userConfig,
    }
  }
}

export const appWithTranslation = (WrappedComponent: React.ComponentType) => {

  const AppWithTranslation: React.FC<AppProps> = (props) => {

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

  return AppWithTranslation
}
