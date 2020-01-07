import { format as formatUrl, parse as parseUrl } from 'url'

import { Config } from '../../types'
import {
  removeSubpath,
  subpathIsPresent,
  subpathIsRequired,
  subpathFromLng,
} from './index'

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

export const lngPathCorrector = (config: Config, currentRoute, currentLanguage) => {
  const { allLanguages, localeSubpaths } = config
  const { as: originalAs, href: originalHref } = currentRoute

  if (!allLanguages.includes(currentLanguage)) {
    throw new Error('Invalid configuration: Current language is not included in all languages array')
  }

  let href = parseHref(originalHref)
  let as = parseAs(originalAs, href)

  /*
    url.format prefers the 'url.search' string over
    the 'url.query' object, so remove the search
    string to ensure the query object is used.
  */
  delete href.search

  /*
    Strip any/all subpaths from the `as` value
  */
  Object.values(localeSubpaths).forEach((subpath: string) => {
    if (subpathIsPresent(as, subpath)) {
      as = removeSubpath(as, subpath)
    }
  })

  if (subpathIsRequired(config, currentLanguage)) {
    const basePath = `${href.protocol}//${href.host}`
    const currentAs = as.replace(basePath, '')
    const subpath = subpathFromLng(config, currentLanguage)

    as = `/${subpath}${currentAs}`.replace(/\/$/, '')
    href.query.lng = currentLanguage
    href.query.subpath = subpath
  }

  return { as, href }
}
