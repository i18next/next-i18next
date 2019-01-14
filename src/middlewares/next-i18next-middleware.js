import i18nextMiddleware from 'i18next-express-middleware'
import { forceTrailingSlash, handleLanguageSubpath, lngPathDetector } from 'utils'
import { parse } from 'url'
import pathMatch from 'path-match'

const route = pathMatch()

export default function (nexti18next) {
  const { config, i18n } = nexti18next
  const { allLanguages, ignoreRoutes, localeSubpaths } = config

  const ignoreRegex = new RegExp(`^\/(?!${ignoreRoutes.map(x => x.replace('/', '')).join('|')}).*$`)
  const ignoreRoute = route(ignoreRegex)
  const isI18nRoute = url => ignoreRoute(url)

  const localeSubpathRoute = route(`/:lng(${allLanguages.join('|')})/*`)
  const isLocaleSubpathRoute = params => params !== false

  const isLocaleRootRouteWithoutSlash = pathname => allLanguages.some(lng => pathname === `/${lng}`)

  const middleware = []

  if (!config.serverLanguageDetection) {
    middleware.push((req, res, next) => {
      if (isI18nRoute(req.url)) {
        req.lng = config.defaultLanguage
      }
      next()
    })
  }

  middleware.push(
    i18nextMiddleware.handle(i18n, { ignoreRoutes }),
    (req, res, next) => {
      if (localeSubpaths) {
        if (isI18nRoute(req.url)) {
          const { pathname } = parse(req.url)

          if (isLocaleRootRouteWithoutSlash(pathname)) {
            forceTrailingSlash(req, res, pathname.slice(1))

            return
          }

          lngPathDetector(req, res)
        }

        const params = localeSubpathRoute(req.url)

        if (isLocaleSubpathRoute(params)) {
          handleLanguageSubpath(req, params.lng)
        }
      }

      next()
    },
  )

  return middleware
}
