import i18nextMiddleware from 'i18next-express-middleware'
import { Request, Response, NextFunction } from 'express'
import pathMatch from 'path-match'

import {
  redirectWithoutCache,
  lngFromReq,
  removeSubpath,
  subpathFromLng,
  subpathIsPresent,
  subpathIsRequired,
  addSubpath,
} from '../utils'

const route = pathMatch()

export default function (nexti18next) {
  const { config, i18n } = nexti18next
  const { allLanguages, ignoreRoutes, localeSubpaths } = config

  const isI18nRoute = (req: Request) => ignoreRoutes.every(x => !req.url.startsWith(x))
  const localeSubpathRoute = route(`/:subpath(${Object.values(localeSubpaths).join('|')})(.*)`)

  const middleware = []

  /*
    If not using server side language detection,
    we need to manually set the language for
    each request
  */
  if (!config.serverLanguageDetection) {
    middleware.push((req: Request, _res: Response, next: NextFunction) => {
      if (isI18nRoute(req)) {
        req.lng = config.defaultLanguage
      }
      next()
    })
  }

  /*
    This does the bulk of the i18next work
  */
  middleware.push(i18nextMiddleware.handle(i18n, { ignoreRoutes }))

  /*
    This does the locale subpath work
  */
  middleware.push((req: Request, res: Response, next: NextFunction) => {
    if (isI18nRoute(req) && req.i18n && subpathIsRequired(config, req.i18n.language)) {
      const lng = lngFromReq(req)
      const currentLngSubpath = subpathFromLng(config, lng)

      /*
        This case will be entered if a subpath
        is required but not present
      */
      if (!subpathIsPresent(req.url, currentLngSubpath)) {

        const otherSubpathPresent = allLanguages.some((l: string) =>
          subpathIsPresent(req.url, subpathFromLng(config, l)))

        if (otherSubpathPresent) {

          /*
            If a user has hit a subpath which does not
            match their language, give preference to
            the path, and change user language.
          */
          allLanguages.forEach((l: string) => {
            if (subpathIsPresent(req.url, subpathFromLng(config, l))) {
              req.i18n.changeLanguage(l)
            }
          })

        } else {

          /*
            If a language subpath is required and
            not present, prepend correct subpath
          */
          return redirectWithoutCache(res, addSubpath(req.url, currentLngSubpath))
        }
        
      }

      /*
        If a locale subpath is present in the URL,
        modify req.url in place so that NextJs will
        render the correct route
      */
      const params = localeSubpathRoute(req.url)
      if (params !== false) {
        const { subpath } = params
        req.query = { ...req.query, subpath, lng }
        req.url = removeSubpath(req.url, subpath)
      }
    }

    next()
  })

  return middleware
}
