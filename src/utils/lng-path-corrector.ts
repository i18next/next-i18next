import { format as formatUrl, parse as parseUrl } from 'url'
import { LinkProps } from 'next/link'

import { Config } from '../../types'
import { removeSubpath, subpathIsPresent } from './index'
import subpathIsRequired from './subpath-is-required'
import subpathFromLng from './subpath-from-lng'

type As = LinkProps['as']
type Href = LinkProps['href']

const parseAs = (originalAs, href): As => {
  const asType = typeof originalAs
  let as

  if (asType === 'undefined') {
    as = formatUrl(href, { unicode: true })
  } else if (asType === 'string' || (asType === 'object' && originalAs !== null)) {
    as = originalAs
  } else {
    throw new Error(`'as' type must be 'string' or an 'object', but it is ${asType}`)
  }

  return as
}

const parseHref = (originalHref): Href => {
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

export default (config: Config, currentRoute, currentLanguage): LinkProps => {
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
  Object.values(localeSubpaths).forEach((subpath) => {
    if (typeof as === 'object') {
      if (subpathIsPresent(as, subpath)) {
        as.pathname = removeSubpath(as.pathname, subpath)
      }
    } else if (typeof as === 'string') {
      if (subpathIsPresent(as, subpath)) {
        as = removeSubpath(as, subpath)
      }
    }
  })

  if (subpathIsRequired(config, currentLanguage)) {
    const basePath = `${href.protocol}//${href.host}`
    let currentAs = ''

    const subpath = subpathFromLng(config, currentLanguage)

    if (typeof as === 'object') {
      currentAs = as.pathname.replace(basePath, '')
      as.pathname = `/${subpath}${currentAs}`.replace(/\/$/, '')
    } else if (typeof as === 'string') {
      currentAs = as.replace(basePath, '')
      as = `/${subpath}${currentAs}`.replace(/\/$/, '')
    }

    href.query.lng = currentLanguage
    href.query.subpath = subpath
  }

  return { as, href }
}
