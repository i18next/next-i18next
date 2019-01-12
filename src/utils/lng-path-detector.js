import { lngFromReq } from 'utils'

export default (req, res, next) => {
  if (req.i18n) {
    const language = lngFromReq(req)
    const { allLanguages, defaultLanguage } = req.i18n.options
    /*
      If a user has hit a subpath which does not
      match their language, give preference to
      the path, and change user language.
    */
    allLanguages.forEach((lng) => {
      if (req.url.startsWith(`/${lng}/`) && language !== lng) {
        req.i18n.changeLanguage(lng)
      }
    })
    /*
      If a user has hit the root path and their
      language is not set to default, give
      preference to the language and redirect
      their path.
    */
    if (language !== defaultLanguage && !req.url.startsWith(`/${language}/`)) {
      allLanguages.forEach((lng) => {
        if (req.url.startsWith(`/${lng}/`)) {
          req.url = req.url.replace(`/${lng}/`, '/')
        }
      })
      res.set('Cache-Control', 'no-cache,no-store')
      res.redirect(301, req.url.replace('/', `/${language}/`))
    }
    /*
      If a user has a default language prefix
      in their URL, strip it.
    */
    if (language === defaultLanguage && req.url.startsWith(`/${defaultLanguage}/`)) {
      res.set('Cache-Control', 'no-cache,no-store')
      res.redirect(301, req.url.replace(`/${defaultLanguage}/`, '/'))
    }
  }
  next()
}
