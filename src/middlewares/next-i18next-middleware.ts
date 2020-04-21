import { NextFunction, Request, Response } from 'express'
import i18nextMiddleware from 'i18next-http-middleware'

import {
  addSubpath,
  lngFromReq,
  redirectWithoutCache,
  subpathFromLng,
  subpathIsPresent,
  subpathIsRequired,
} from '../utils'
import { NextI18NextRequest } from '../../types'

export default function (nexti18next) {
  const { config, i18n } = nexti18next
  const { allLanguages, ignoreRoutes } = config

  const isI18nRoute = (req: Request) => ignoreRoutes.every(x => !req.url.startsWith(x))

  const middleware = []

  /*
    If not using server side language detection,
    we need to manually set the language for
    each request
  */
  if (!config.serverLanguageDetection) {
    middleware.push((req: NextI18NextRequest, _res: Response, next: NextFunction) => {
      if (isI18nRoute(req)) {
        req.lng = config.defaultLanguage
      }
      next()
    })
  }

  /*
    This does the bulk of the i18next work
  */
  middleware.push(i18nextMiddleware.handle(i18n))

  /*
    This does the locale subpath work
  */
  middleware.push((req: NextI18NextRequest, res: Response, next: NextFunction) => {
    if (isI18nRoute(req) && req.i18n) {
      let currentLng = lngFromReq(req)
      const currentLngSubpath = subpathFromLng(config, currentLng)
      const currentLngRequiresSubpath = subpathIsRequired(config, currentLng)
      const currentLngSubpathIsPresent = subpathIsPresent(req.url, currentLngSubpath)

      const lngFromCurrentSubpath = allLanguages.find((l: string) =>
        subpathIsPresent(req.url, subpathFromLng(config, l)))

      if (lngFromCurrentSubpath !== undefined && lngFromCurrentSubpath !== currentLng) {
        /*
          If a user has hit a subpath which does not
          match their language, give preference to
          the path, and change user language.
        */
        req.i18n.changeLanguage(lngFromCurrentSubpath)
        currentLng = lngFromCurrentSubpath

      } else if (currentLngRequiresSubpath && !currentLngSubpathIsPresent) {

        /*
          If a language subpath is required and
          not present, prepend correct subpath
        */
        return redirectWithoutCache(res, addSubpath(req.url, currentLngSubpath))

      }
    }

    next()
  })

  return middleware
}
