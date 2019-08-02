import { localeSubpathOptions } from '../config/default-config'

export default (nextI18NextInternals, lng) => {
  const {
    defaultLanguage,
    localeSubpaths,
  } = nextI18NextInternals.config

  if (lng) {

    if (localeSubpaths === localeSubpathOptions.NONE) {
      return false
    }

    if (localeSubpaths === localeSubpathOptions.FOREIGN && lng !== defaultLanguage) {
      return true
    }

    if (localeSubpaths === localeSubpathOptions.ALL) {
      return true
    }

  }

  return false

}
