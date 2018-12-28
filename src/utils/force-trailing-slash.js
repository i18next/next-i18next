import { parse } from 'url'

export default (req, res, next) => {
  const { pathname, search } = parse(req.url)
  let performedRedirect = false
  req.i18n.options.allLanguages.forEach((lng) => {
    if (pathname === `/${lng}`) {
      res.redirect(301, pathname.replace(`/${lng}`, `/${lng}/`) + (search || ''))
      performedRedirect = true
    }
  })
  if (!performedRedirect) {
    next()
  }
}
