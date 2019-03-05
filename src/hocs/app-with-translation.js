import React from 'react'
import { withRouter } from 'next/router'

import hoistNonReactStatics from 'hoist-non-react-statics'
import { I18nextProvider } from 'react-i18next'

import { lngFromReq, lngPathCorrector } from '../utils'
import { localeSubpathOptions } from '../config/default-config'
import { NextStaticProvider } from '../components'

export default function (WrappedComponent) {

  const { config, consoleMessage, i18n } = this

  class AppWithTranslation extends React.Component {

    constructor(props) {
      super(props)

      if (process.browser && config.localeSubpaths !== localeSubpathOptions.NONE) {
        i18n.on('languageChanged', (lng) => {
          const { router } = props
          const { pathname, asPath, query } = router
          const routeInfo = { pathname, query }
          const { as, href } = lngPathCorrector(config, { as: asPath, href: routeInfo }, lng)
          if (as !== asPath) {
            router.replace(href, as, { shallow: true })
          }
        })
      }
    }

    static async getInitialProps(ctx) {

      let wrappedComponentProps = { pageProps: {} }
      if (WrappedComponent.getInitialProps) {
        wrappedComponentProps = await WrappedComponent.getInitialProps(ctx)
      }
      if (typeof wrappedComponentProps.pageProps === 'undefined') {
        consoleMessage(
          'error',
          'If you have a getInitialProps method in your custom _app.js file, you must explicitly return pageProps. For more information, see: https://github.com/zeit/next.js#custom-app',
        )
      }

      // Initiate vars to return
      const { req } = ctx.ctx
      let initialI18nStore = {}
      let initialLanguage = null
      let i18nServerInstance = null

      // Step 1: Determine initial language
      if (req && req.i18n) {

        initialLanguage = lngFromReq(req)

        // Perform a lang change in case we're not on the right lang
        await req.i18n.changeLanguage(initialLanguage)

      } else if (Array.isArray(i18n.languages) && i18n.languages.length > 0) {
        initialLanguage = i18n.language
      }

      // Step 2: Determine namespace dependencies
      let namespacesRequired = config.ns
      if (Array.isArray(wrappedComponentProps.pageProps.namespacesRequired)) {
        ({ namespacesRequired } = wrappedComponentProps.pageProps)
      } else {
        consoleMessage(
          'warn',
          `You have not declared a namespacesRequired array on your page-level component: ${ctx.Component.displayName || ctx.Component.name || 'Component'}. This will cause all namespaces to be sent down to the client, possibly negatively impacting the performance of your app. For more info, see: https://github.com/isaachinman/next-i18next#4-declaring-namespace-dependencies`,
        )
      }

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

      // Step 4: Overwrite i18n.toJSON method to be able to serialize the instance
      if (req && req.i18n) {
        req.i18n.toJSON = () => null
        i18nServerInstance = req.i18n
      }

      // `pageProps` will get serialized automatically by NextJs
      return {
        initialI18nStore,
        initialLanguage,
        i18nServerInstance,
        ...wrappedComponentProps,
      }
    }

    render() {
      const { initialLanguage, initialI18nStore, i18nServerInstance } = this.props

      return (
        <I18nextProvider
          i18n={i18nServerInstance || i18n}
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

  return hoistNonReactStatics(
    withRouter(AppWithTranslation), WrappedComponent, { getInitialProps: true },
  )

}
