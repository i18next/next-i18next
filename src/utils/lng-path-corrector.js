import { format as formatUrl, parse as parseUrl } from 'url'
import { localeSubpathOptions } from '../config/default-config'

const parseAs = (originalAs, href) => {
  const asType = typeof originalAs
  let as

  if (asType === 'undefined') {
    as = formatUrl(href, { unicode: true })
  } else if (asType === 'string') {
    as = originalAs
  } else {
    throw new Error(`'as' type must be 'string', but it is ${asType}`)
  }

  return as
}

const parseHref = (originalHref) => {
  const hrefType = typeof originalHref
  let href

  if (hrefType === 'string') {
    href = parseUrl(originalHref, true /* parseQueryString */)
  } else if (hrefType === 'object') {
    href = { ...originalHref }
    href.query = originalHref.query ? { ...originalHref.query } : {}
  } else {
    throw new Error(`'href' type must be either 'string' or 'object', but it is ${hrefType}`)
  }

  return href
}

export default (config, currentRoute, currentLanguage) => {
  const { defaultLanguage, allLanguages, localeSubpaths } = config
  const { as: originalAs, href: originalHref } = currentRoute

  if (!allLanguages.includes(currentLanguage)) {
    throw new Error('Invalid configuration: Current language is not included in all languages array')
  }

  const href = parseHref(originalHref)
  let as = parseAs(originalAs, href)

  // url.format prefers the 'url.search' string over the 'url.query' object,
  // so remove the search string to ensure the query object is used
  delete href.search

  for (const lng of allLanguages) {
    if (as.startsWith(`/${lng}/`)) {
      as = as.replace(`/${lng}/`, '/')
      break
    }
  }

  if (currentLanguage !== defaultLanguage || localeSubpaths === localeSubpathOptions.ALL) {
    const basePath = `${href.protocol}//${href.host}`
    const currentAs = as.replace(basePath, '')
    as = `/${currentLanguage}${currentAs}`
    href.query.lng = currentLanguage
  }

  return { as, href }
}
