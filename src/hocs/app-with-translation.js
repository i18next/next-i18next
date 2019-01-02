import React from 'react'
import Router from 'next/router'

import { I18nextProvider } from 'react-i18next'
import { createConsoleMessage, lngPathCorrector } from 'utils'
import { NextStaticProvider } from 'components'

import hoistNonReactStatics from 'hoist-non-react-statics'

export default function (WrappedComponent) {

  const { config, i18n } = this

  class AppWithTranslation extends React.Component {

    constructor() {
      super()
      if (config.localeSubpaths) {
        i18n.on('languageChanged', (lng) => {
          if (process.browser) {
            const originalRoute = window.location.pathname
            const [href, as] = lngPathCorrector(config, i18n, originalRoute, lng)
            if (as !== originalRoute) {
              Router.replace(href, as, { shallow: true })
            }
          }

        })
      }

      this.createConsoleMessage = (type, message, traceLimit = 0) => {
        createConsoleMessage(
          type,
          message,
          {
            strictMode: config.strictMode,
            traceLimit,
          },
        )
      }
    }

    static async getInitialProps({ Component, ctx, ...initObject }) {

      let pageProps = {}
      let regularProps = {}

      if (Component.getInitialProps) {
        pageProps = await Component.getInitialProps(ctx)
      }

      // Run getInitialProps on wrapped _app
      if (WrappedComponent.getInitialProps) {
        const { pageProps: wrappedPageProps, ...rest } = await WrappedComponent
          .getInitialProps({ Component, ctx, ...initObject })
        pageProps = {
          ...pageProps,
          ...wrappedPageProps,
        }
        regularProps = rest
      }

      // Initiate vars to return
      const { req } = ctx
      let initialI18nStore = {}
      let initialLanguage = null

      // Step 1: Determine initial language
      if (req && req.i18n) {

        // First language in array is current lang
        [initialLanguage] = req.i18n.languages

        // Perform a lang change in case we're not on the right lang
        await i18n.changeLanguage(initialLanguage)

      } else if (Array.isArray(i18n.languages) && i18n.languages.length > 0) {
        initialLanguage = i18n.language
      }

      // Step 2: Determine namespace dependencies
      let namespacesRequired = config.ns
      if (Array.isArray(pageProps.namespacesRequired)) {
        ({ namespacesRequired } = pageProps)
      }
      this.createConsoleMessage(
        'warn',
        `You have not declared a namespacesRequired array on your page-level component: ${Component.displayName}. This will cause all namespaces to be sent down to the client, possibly negatively impacting the performance of your app. For more info, see: https://github.com/isaachinman/next-i18next#4-declaring-namespace-dependencies`,
      )


      // We must always send down the defaultNS, otherwise
      // the client will trigger a request for it and issue
      // the "Did not expect server HTML to contain a <h1> in <div>"
      // error
      if (!namespacesRequired.includes(config.defaultNS)) {
        namespacesRequired.push(config.defaultNS)
      }

      // Step 3: Perform data fetching, depending on environment
      if (req && req.i18n) {

        // Initialise the store with only the initialLanguage and
        // necessary namespaces needed to render this specific tree
        const { fallbackLng } = config
        initialI18nStore[initialLanguage] = {}
        if (fallbackLng) {
          initialI18nStore[fallbackLng] = {}
        }
        namespacesRequired.forEach((ns) => {
          initialI18nStore[initialLanguage][ns] = (
            (req.i18n.services.resourceStore.data[initialLanguage] || {})[ns] || {}
          )
          if (fallbackLng) {
            initialI18nStore[fallbackLng][ns] = (
              (req.i18n.services.resourceStore.data[fallbackLng] || {})[ns] || {}
            )
          }
        })

      } else if (Array.isArray(i18n.languages) && i18n.languages.length > 0) {

        // Load newly-required translations if changing route clientside
        await Promise.all(
          namespacesRequired
            .filter(ns => !i18n.hasResourceBundle(i18n.languages[0], ns))
            .map(ns => new Promise(resolve => i18n.loadNamespaces(ns, () => resolve()))),
        )
        initialI18nStore = i18n.store.data

      }

      // `pageProps` will get serialized automatically by NextJs
      return {
        initialI18nStore,
        initialLanguage,
        pageProps,
        ...regularProps,
      }
    }

    render() {
      let { initialLanguage, initialI18nStore } = this.props
      if (!process.browser) {
        initialLanguage = i18n.language
        initialI18nStore = i18n.store.data
      }
      return (
        <I18nextProvider
          i18n={i18n}
          initialLanguage={initialLanguage}
          initialI18nStore={initialI18nStore}
        >
          <NextStaticProvider>
            <WrappedComponent {...this.props} />
          </NextStaticProvider>
        </I18nextProvider>
      )
    }
  }

  return hoistNonReactStatics(AppWithTranslation, WrappedComponent, { getInitialProps: true })

}
