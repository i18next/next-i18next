import { parse } from 'url'
import { redirectWithoutCache } from 'utils'

export default (req, res, next) => {
  const { pathname, search } = parse(req.url)
  let performedRedirect = false
  req.i18n.options.allLanguages.forEach((lng) => {
    if (pathname === `/${lng}`) {
      redirectWithoutCache(res, pathname.replace(`/${lng}`, `/${lng}/`) + (search || ''))
      performedRedirect = true
    }
  })
  if (!performedRedirect) {
    next()
  }
}
