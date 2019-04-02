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
import { lngPathCorrector, localeSubpathRequired } from '../utils'

const propertyFields = ['pathname', 'route', 'query', 'asPath', 'components', 'events']
const coreMethods = ['reload', 'back', 'beforePopState', 'ready', 'prefetch']
const wrappedMethods = ['push', 'replace']

export default function (nextI18NextInternals) {
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
      const { config, i18n } = nextI18NextInternals

      if (localeSubpathRequired(nextI18NextInternals, i18n.languages[0])) {
        const { as: correctedAs, href: correctedHref } = lngPathCorrector(
          config, { as, href: path }, i18n.languages[0],
        )

        return NextRouter[method](correctedHref, correctedAs, options)
      }

      return NextRouter[method](path, as, options)
    }
  })

  return Router
}
