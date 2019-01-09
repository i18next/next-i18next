import { parse } from 'url'
import pathMatch from 'path-match'
import { redirectWithoutCache } from 'utils'

const route = pathMatch()

export default (allLanguages, ignoreRegex) => {
  const ignoreRoute = route(ignoreRegex)

  return (req, res, next) => {
    const params = ignoreRoute(req.url)
    let performedRedirect = false

    if (params) {
      const { pathname, search } = parse(req.url)
      allLanguages.forEach((lng) => {
        if (pathname === `/${lng}`) {
          redirectWithoutCache(res, pathname.replace(`/${lng}`, `/${lng}/`) + (search || ''))
          performedRedirect = true
        }
      })
    }

    if (!performedRedirect) {
      next()
    }
  }
}
