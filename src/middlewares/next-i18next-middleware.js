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
  const isNotRouteToIgnore = url => ignoreRoute(url)

  const localeRoute = route(`/:lng(${allLanguages.join('|')})/*`)

  const isLocaleRootRouteWithoutSlash = pathname => allLanguages.some(lng => pathname === `/${lng}`)

  const middleware = []

  if (!config.serverLanguageDetection) {
    middleware.push((req, res, next) => {
      if (isNotRouteToIgnore(req.url)) {
        req.lng = config.defaultLanguage
      }
      next()
    })
  }

  middleware.push(
    i18nextMiddleware.handle(i18n, { ignoreRoutes }),
    (req, res, next) => {
      if (localeSubpaths) {
        if (isNotRouteToIgnore(req.url)) {
          const { pathname } = parse(req.url)

          if (isLocaleRootRouteWithoutSlash(pathname)) {
            forceTrailingSlash(req, res, pathname.slice(1))

            return
          }

          lngPathDetector(req, res)
        }

        const params = localeRoute(req.url)

        if (params) {
          handleLanguageSubpath(req, params.lng)
        }
      }

      next()
    },
  )

  return middleware
}
