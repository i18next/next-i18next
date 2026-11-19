import { NextRequest, NextResponse } from 'next/server'
import type { I18nConfig } from '../types'
import { normalizeConfig } from '../config'
import { parseAcceptLanguage, matchLanguage, findSupportedMatch } from './languageDetector'
import { toInternalPath, toLocalizedPath, validatePathnames } from '../pathnames'

// Re-export config utilities for Edge-safe usage (no react-i18next dependency)
export { defineConfig, normalizeConfig } from '../config'
export type { I18nConfig, NormalizedConfig, ResourceLoader, CookieOptions, Pathnames } from '../types'

// A language tag: a 2-3 letter language with an optional region (2 letters or 3 digits).
// A script subtag only counts with a region after it (zh-Hant-TW), as "jobs" has the
// shape of a script too.
const LANGUAGE_TAG = /^[a-z]{2,3}(?:-[a-z]{4}-(?:[a-z]{2}|\d{3})|-(?:[a-z]{2}|\d{3}))?$/i

/**
 * The locale in the first path segment. An exact supported code (case-insensitive) is
 * served as-is. A segment shaped like a language tag that resolves to a supported code
 * (en-gb -> en, or en -> en-US with nonExplicitSupportedLngs) is returned with
 * `exact: false`, so the caller can move it to that code. Anything else (/it-jobs,
 * /my-account) is a route, not a locale.
 */
// Set on the request of every rewrite. Next.js (16.3) runs the proxy again for the
// rewrite target, with the headers the rewrite set; that run must serve it as is,
// or hideDefaultLocale (/ -> /en -> /) and translated paths redirect back in a loop.
const REWRITTEN_HEADER = 'x-i18next-rewritten'

function findLocaleInPath(
  pathname: string,
  supportedLngs: readonly string[],
  nonExplicitSupportedLngs: boolean,
): { lng: string, exact: boolean } | undefined {
  const match = pathname.match(/^\/([^/]+)/)
  if (!match) return undefined
  const segment = match[1]
  const exact = supportedLngs.find(l => l.toLowerCase() === segment.toLowerCase())
  if (exact) return { lng: exact, exact: true }
  if (!LANGUAGE_TAG.test(segment)) return undefined
  const lng = findSupportedMatch(segment, supportedLngs, nonExplicitSupportedLngs)
  return lng ? { lng, exact: false } : undefined
}

export function createProxy(userConfig: I18nConfig) {
  const config = normalizeConfig(userConfig)
  const nonExplicit = config.nonExplicitSupportedLngs
  // Normalize basePath: ensure leading slash, strip trailing slash
  const basePath = config.basePath
    ? ('/' + config.basePath.replace(/^\/+/, '').replace(/\/+$/, ''))
    : undefined
  // translated paths need the locale in the public URL to know the language of a path
  const pathnames = config.localeInPath === true ? config.pathnames : undefined
  if (pathnames) validatePathnames(pathnames)
  // a path in `lng` (translated or the internal route) -> its translated public form
  const localize = (path: string, lng: string) =>
    toLocalizedPath(toInternalPath(path, lng, pathnames) ?? path, lng, pathnames)

  // Persist the language in the cookie, but only when it actually changed. Next merges a
  // cookie set here into the request's mutable cookies and treats any modified cookie as a
  // revalidation, so an unconditional write made every Server Action (its POST carries the
  // page as referer) refetch the whole page. Trade-off: maxAge is only refreshed on change.
  const persistLanguage = (req: NextRequest, response: NextResponse, lng: string) => {
    if (!config.persistCookie) return
    if (req.cookies.get(config.cookieName)?.value === lng) return
    response.cookies.set(config.cookieName, lng, {
      path: '/',
      maxAge: config.cookieMaxAge,
      sameSite: 'lax',
      ...config.cookieOptions,
    })
  }

  return function middleware(req: NextRequest): NextResponse {
    // nextUrl.pathname has Next's own basePath (next.config) stripped; String(nextUrl)
    // adds it back. Redirect/rewrite targets are therefore built from nextUrl.clone(),
    // never from `new URL(path, req.url)`, which would drop that basePath (and trailingSlash).
    const { pathname } = req.nextUrl

    // When basePath is set, only handle requests under that prefix
    if (basePath) {
      if (pathname !== basePath && !pathname.startsWith(basePath + '/')) {
        return NextResponse.next()
      }
    }

    // Skip ignored paths
    for (const ignored of config.ignoredPaths) {
      if (pathname.startsWith(ignored)) {
        return NextResponse.next()
      }
    }

    // Skip common static file extensions
    if (/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|map|woff2?|ttf|eot)$/.test(pathname)) {
      return NextResponse.next()
    }

    // The target of one of our own rewrites
    if (req.headers.has(REWRITTEN_HEADER)) {
      return NextResponse.next()
    }

    // Detect language from cookie, then Accept-Language header, then default
    let lng: string | undefined
    const cookieValue = req.cookies.get(config.cookieName)?.value
    if (cookieValue) {
      lng = findSupportedMatch(cookieValue, config.supportedLngs, nonExplicit)
    }
    if (!lng) {
      lng = matchLanguage(
        parseAcceptLanguage(req.headers.get('Accept-Language')),
        config.supportedLngs,
        config.fallbackLng,
        nonExplicit,
      )
    }
    if (!lng) {
      lng = config.fallbackLng
    }

    // For locale-in-path detection, strip basePath prefix so we look at the right segment
    const pathForLocale = basePath ? pathname.slice(basePath.length) || '/' : pathname
    const localeInPath = findLocaleInPath(pathForLocale, config.supportedLngs, nonExplicit)
    const lngInPath = localeInPath?.lng

    if (config.localeInPath) {
      const prefix = basePath ?? ''
      const pathAfterBase = basePath ? pathname.slice(basePath.length) : pathname
      // 'internal': the proxy never puts a locale into the public URL — clean URLs are
      // rewritten to the detected language. Explicit locale paths are served as-is:
      // redirecting them (and setting the cookie) would let <Link> prefetches flip
      // the language, since the browser stores Set-Cookie from prefetch redirects too.
      const internal = config.localeInPath === 'internal'

      // hideDefaultLocale: redirect explicit default-locale paths to the clean URL
      if (!internal && config.hideDefaultLocale && lngInPath === config.fallbackLng) {
        const pathWithoutLocale = pathAfterBase.replace(/^\/[^/]+/, '') || '/'
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = `${prefix}${localize(pathWithoutLocale, config.fallbackLng)}`
        const response = NextResponse.redirect(redirectUrl)
        persistLanguage(req, response, config.fallbackLng)
        return response
      }

      // Set custom header for server components to read
      const headers = new Headers(req.headers)
      headers.set(config.headerName, lngInPath || lng)

      // A non-canonical locale segment (/en-gb/about with supportedLngs ['en']) is moved
      // to its supported code. 'internal' rewrites instead, as it never redirects explicit
      // locale paths, and no cookie is set for the same prefetch reason.
      if (localeInPath && !localeInPath.exact) {
        const url = req.nextUrl.clone()
        url.pathname = `${prefix}/${localeInPath.lng}${pathAfterBase.replace(/^\/[^/]+/, '')}`
        if (internal) {
          headers.set(REWRITTEN_HEADER, '1')
          return NextResponse.rewrite(url, { request: { headers } })
        }
        return NextResponse.redirect(url)
      }

      // Redirect if no locale in path
      if (!lngInPath) {
        if (internal || config.hideDefaultLocale) {
          // Rewrite internally to the locale path, keeping the clean URL:
          // the detected language in internal mode, the default locale for hideDefaultLocale
          const rewriteLng = internal ? lng : config.fallbackLng
          let rewritePath = pathAfterBase
          if (pathnames) {
            // hideDefaultLocale: clean paths are in the default language
            const internalPath = toInternalPath(pathAfterBase, rewriteLng, pathnames)
            const localized = toLocalizedPath(pathAfterBase, rewriteLng, pathnames)
            if (internalPath) rewritePath = internalPath
            else if (localized !== pathAfterBase) {
              const redirectUrl = req.nextUrl.clone()
              redirectUrl.pathname = `${prefix}${localized}`
              return NextResponse.redirect(redirectUrl)
            }
          }
          const rewriteUrl = req.nextUrl.clone()
          rewriteUrl.pathname = `${prefix}/${rewriteLng}${rewritePath}`
          headers.set(config.headerName, rewriteLng)
          headers.set(REWRITTEN_HEADER, '1')
          const response = NextResponse.rewrite(rewriteUrl, { request: { headers } })
          persistLanguage(req, response, rewriteLng)
          return response
        }

        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = `${prefix}/${lng}${localize(pathAfterBase, lng)}`
        const response = NextResponse.redirect(redirectUrl)
        persistLanguage(req, response, lng)
        return response
      }

      let response: NextResponse | undefined
      if (pathnames && lngInPath) {
        // /de/kontakt serves /de/contact; /de/contact redirects to /de/kontakt
        const rest = pathAfterBase.replace(/^\/[^/]+/, '') || '/'
        const internalPath = toInternalPath(rest, lngInPath, pathnames)
        const url = req.nextUrl.clone()
        if (internalPath !== undefined && internalPath !== rest) {
          url.pathname = `${prefix}/${lngInPath}${internalPath}`
          headers.set(REWRITTEN_HEADER, '1')
          response = NextResponse.rewrite(url, { request: { headers } })
        } else if (internalPath === undefined) {
          const localized = toLocalizedPath(rest, lngInPath, pathnames)
          if (localized !== rest) {
            url.pathname = `${prefix}/${lngInPath}${localized}`
            return NextResponse.redirect(url)
          }
        }
      }

      // Persist language from referer URL into cookie
      response ??= NextResponse.next({ request: { headers } })
      // The referer is a client-supplied header; a value that isn't a URL is ignored
      // instead of failing the whole request
      let refererUrl: URL | undefined
      try {
        if (req.headers.has('referer')) refererUrl = new URL(req.headers.get('referer')!)
      } catch {}
      if (refererUrl) {
        // The referer still carries Next's basePath, unlike nextUrl.pathname
        const nextBasePath = req.nextUrl.basePath
        const refererPath = nextBasePath && refererUrl.pathname.startsWith(nextBasePath)
          ? refererUrl.pathname.slice(nextBasePath.length) || '/'
          : refererUrl.pathname
        const refererPathForLocale = basePath
          ? refererPath.slice(basePath.length) || '/'
          : refererPath
        const lngInReferer = findLocaleInPath(refererPathForLocale, config.supportedLngs, nonExplicit)
        if (lngInReferer) {
          persistLanguage(req, response, lngInReferer.lng)
        }
      }

      return response
    } else {
      // No-locale-path mode: don't redirect, just set the header
      const headers = new Headers(req.headers)
      headers.set(config.headerName, lng)

      const response = NextResponse.next({ request: { headers } })
      return response
    }
  }
}

/**
 * Backwards-compatible alias for createProxy.
 * Use `createProxy` for new projects with Next.js 16+ `proxy.ts`.
 */
export const createMiddleware = createProxy
