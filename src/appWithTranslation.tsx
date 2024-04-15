import React, { useMemo, useRef } from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'
import { I18nextProvider } from 'react-i18next'
import type { AppProps as NextJsAppProps } from 'next/app'

import { createConfig } from './config/createConfig'
import createClient from './createClient'

import { SSRConfig, UserConfig } from './types'

import { i18n as I18NextClient, Resource } from 'i18next'
import { useIsomorphicLayoutEffect } from './utils'
export {
  Trans,
  useTranslation,
  withTranslation,
} from 'react-i18next'

export let globalI18n: I18NextClient | null = null

const addResourcesToI18next = (instance: I18NextClient, resources: Resource) => {
  if (resources && instance.isInitialized) {
    for (const locale of Object.keys(resources)) {
      for (const ns of Object.keys(resources[locale])) {
        if (!instance?.store?.data || !instance.store.data[locale] || !instance.store.data[locale][ns]) {
          instance.addResourceBundle(
            locale,
            ns,
            resources[locale][ns],
            true,
            true
          )
        }
      }
    }
  }
}

export const appWithTranslation = <Props extends NextJsAppProps>(
  WrappedComponent: React.ComponentType<Props>,
  configOverride: UserConfig | null = null
) => {
  const AppWithTranslation = (
    props: Props & { pageProps: Props['pageProps'] & SSRConfig }
  ) => {
    const { _nextI18Next } = props.pageProps || {} // pageProps may be undefined on strange setups, i.e. https://github.com/i18next/next-i18next/issues/2109
    let locale: string | undefined =
      _nextI18Next?.initialLocale ?? props?.router?.locale
    const ns = _nextI18Next?.ns

    const instanceRef = useRef<I18NextClient | null>(null)

    /**
     * Memoize i18n instance and reuse it rather than creating new instance.
     * When the locale or resources are changed after instance was created,
     * we will update the instance by calling addResourceBundle method on it.
     */
    const i18n: I18NextClient | null = useMemo(() => {
      if (!_nextI18Next && !configOverride) return null

      const userConfig = configOverride ?? _nextI18Next?.userConfig

      if (!userConfig) {
        throw new Error(
          'appWithTranslation was called without a next-i18next config'
        )
      }

      if (!userConfig?.i18n) {
        throw new Error(
          'appWithTranslation was called without config.i18n'
        )
      }

      if (!userConfig?.i18n?.defaultLocale) {
        throw new Error(
          'config.i18n does not include a defaultLocale property'
        )
      }

      const { initialI18nStore } = _nextI18Next || {}
      const resources = configOverride?.resources
        ? configOverride.resources
        : initialI18nStore

      if (!locale) locale = userConfig.i18n.defaultLocale

      let instance = instanceRef.current
      if (instance) {
        addResourcesToI18next(instance, resources)
      } else {
        instance = createClient({
          ...createConfig({
            ...userConfig,
            lng: locale,
          }),
          lng: locale,
          ...(ns && { ns }),
          resources,
        }).i18n

        addResourcesToI18next(instance, resources)

        globalI18n = instance
        instanceRef.current = instance
      }

      return instance
    }, [_nextI18Next, locale, ns])

    /**
     * Since calling changeLanguage method on existing i18n instance cause state update in react,
     * we need to call the method in `useLayoutEffect` to prevent state update in render phase.
     */
    useIsomorphicLayoutEffect(() => {
      if (!i18n || !locale) return
      i18n.changeLanguage(locale)
    }, [i18n, locale])

    return i18n !== null ? (
      <I18nextProvider i18n={i18n}>
        <WrappedComponent {...props} />
      </I18nextProvider>
    ) : (
      <WrappedComponent key={locale} {...props} />
    )
  }

  return hoistNonReactStatics(AppWithTranslation, WrappedComponent)
}
