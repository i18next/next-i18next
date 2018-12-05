export default (req, res, next) => {
  if (req.i18n) {
    const language = req.i18n.languages[0]
    const { allLanguages, defaultLanguage, defaultLocaleSubpath } = req.i18n.options
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
      preference to the path and reset their
      language.
    */
    if (language !== defaultLanguage && !req.url.startsWith(`/${language}/`)) {
      req.i18n.changeLanguage(defaultLanguage)
    }
    /*
      If a user has a default language prefix in their URL
      and defaultLocaleSubpath set to false, strip it.
    */
    if (
      language === defaultLanguage
      && req.url.startsWith(`/${defaultLanguage}/`)
      && !defaultLocaleSubpath
    ) {
      res.redirect(301, req.url.replace(`/${defaultLanguage}/`, '/'))
    }
  }
  next()
}
