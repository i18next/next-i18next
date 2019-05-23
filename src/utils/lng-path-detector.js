import lngFromReq from './lng-from-req'
import { localeSubpathOptions } from '../config/default-config'

export default (req) => {
  const config = {
    originalUrl: req.url,
    correctedUrl: req.url,
  }

  if (req.i18n) {
    const language = lngFromReq(req)
    const { allLanguages, defaultLanguage, localeSubpaths } = req.i18n.options
    let languageChanged = false
    /*
      If a user has hit a subpath which does not
      match their language, give preference to
      the path, and change user language.
    */
    allLanguages.forEach((lng) => {
      if (req.url.startsWith(`/${lng}/`) && language !== lng) {
        req.i18n.changeLanguage(lng)
        languageChanged = true
      }
    })
    /*
      If a user has hit the root path and their
      language is not set to default, give
      preference to the language and redirect
      their path.
    */
    const languageNeedsSubpath = (localeSubpaths === localeSubpathOptions.FOREIGN
      && language !== defaultLanguage)
      || localeSubpaths === localeSubpathOptions.ALL

    if (!languageChanged && languageNeedsSubpath && !req.url.startsWith(`/${language}/`)) {
      allLanguages.forEach((lng) => {
        if (req.url.startsWith(`/${lng}/`)) {
          config.correctedUrl = req.url.replace(`/${lng}/`, '/')
        }
      })
    }
    /*
      If a user has a default language prefix
      in their URL, strip it.
    */
    if (language === defaultLanguage
        && req.url.startsWith(`/${defaultLanguage}/`)
        && localeSubpaths !== localeSubpathOptions.ALL) {
      config.correctedUrl = req.url.replace(`/${defaultLanguage}/`, '/')
    }
  }

  return config
}
