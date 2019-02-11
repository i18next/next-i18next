/*
  This `Router` is a wrap of the standard
  NextJs `Router`, with some simple lang
  redirect logic in place.

  If you haven't already, read this issue comment:
  https://github.com/zeit/next.js/issues/2833#issuecomment-414919347

  Very important: if you import `Router` from NextJs directly,
  and not this file, your lang subpath routing will break.
*/
import NextRouter from 'next/router'
import { format } from 'url'
import { parseHref, lngPathCorrector, localeSubpathRequired } from '../utils'

const propertyFields = ['pathname', 'route', 'query', 'asPath', 'components', 'events']
const coreMethods = ['reload', 'back', 'beforePopState', 'ready', 'prefetch']
const wrappedMethods = ['push', 'replace']

export default function (nextI18NextConfig) {
  const Router = {}

  propertyFields.forEach((field) => {
    Object.defineProperty(Router, field, {
      get() {
        return NextRouter[field]
      },
    })
  })

  coreMethods.forEach((method) => {
    Router[method] = (...args) => NextRouter[method](...args)
  })

  wrappedMethods.forEach((method) => {
    Router[method] = (path, as, options) => {
      const { config, i18n } = nextI18NextConfig

      if (localeSubpathRequired(nextI18NextConfig, i18n.languages[0])) {
        const href = parseHref(path)
        const { pathname, query } = href
        const asPath = as || format(href, { unicode: true })
        const [correctedAs, correctedQuery] = lngPathCorrector(config, i18n, { asPath, query })

        return NextRouter[method]({ pathname, query: correctedQuery }, correctedAs, options)
      }

      return NextRouter[method](path, as, options)
    }
  })

  return Router
}
