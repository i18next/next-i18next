import i18nextMiddleware from 'i18next-express-middleware'
import { forceTrailingSlash, handleLanguageSubpath, lngPathDetector } from 'utils'
import pathMatch from 'path-match'

const route = pathMatch()

export default function (nexti18next) {

  const { config, i18n } = nexti18next
  const { allLanguages, ignoreRoutes, localeSubpaths } = config

  const ignoreRegex = new RegExp(`^\/(?!${ignoreRoutes.map(x => x.replace('/', '')).join('|')}).*$`)
  const ignoreRoute = route(ignoreRegex)
  const isI18nRoute = url => ignoreRoute(url) !== false

  const middleware = []

  if (!config.serverLanguageDetection) {
    middleware.push((req, res, next) => {
      if (isI18nRoute(req.url)) {
        req.lng = config.defaultLanguage
      }
      next()
    })
  }

  middleware.push(i18nextMiddleware.handle(i18n, { ignoreRoutes }))

  if (localeSubpaths) {
    middleware.push(
      forceTrailingSlash(allLanguages, ignoreRegex),
      lngPathDetector(ignoreRegex),
      handleLanguageSubpath(allLanguages),
    )
  }

  return middleware
}
