import { NextRequest, NextResponse } from 'next/server'
import type { I18nConfig } from '../types'
import { normalizeConfig } from '../config'
import { parseAcceptLanguage, matchLanguage, findSupportedMatch } from './languageDetector'

// Re-export config utilities for Edge-safe usage (no react-i18next dependency)
export { defineConfig, normalizeConfig } from '../config'
export type { I18nConfig, NormalizedConfig, ResourceLoader } from '../types'

function findLocaleInPath(
  pathname: string,
  supportedLngs: readonly string[],
  nonExplicitSupportedLngs: boolean,
): string | undefined {
  // Extract the first path segment
  const match = pathname.match(/^\/([^/]+)/)
  if (!match) return undefined
  return findSupportedMatch(match[1], supportedLngs, nonExplicitSupportedLngs)
}

export function createProxy(userConfig: I18nConfig) {
  const config = normalizeConfig(userConfig)
  const nonExplicit = config.nonExplicitSupportedLngs
  // Normalize basePath: ensure leading slash, strip trailing slash
  const basePath = config.basePath
    ? ('/' + config.basePath.replace(/^\/+/, '').replace(/\/+$/, ''))
    : undefined

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

    // Detect language from cookie, then Accept-Language header, then default
    let lng: string | undefined
    const cookieValue = req.cookies.get(config.cookieName)?.value
    if (cookieValue) {
      lng = matchLanguage([cookieValue], config.supportedLngs, config.fallbackLng, nonExplicit)
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
    const lngInPath = findLocaleInPath(pathForLocale, config.supportedLngs, nonExplicit)

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
        redirectUrl.pathname = `${prefix}${pathWithoutLocale}`
        const response = NextResponse.redirect(redirectUrl)
        response.cookies.set(config.cookieName, config.fallbackLng, {
          path: '/',
          maxAge: config.cookieMaxAge,
          sameSite: 'lax',
        })
        return response
      }

      // Set custom header for server components to read
      const headers = new Headers(req.headers)
      headers.set(config.headerName, lngInPath || lng)

      // Redirect if no locale in path
      if (!lngInPath) {
        if (internal || config.hideDefaultLocale) {
          // Rewrite internally to the locale path, keeping the clean URL:
          // the detected language in internal mode, the default locale for hideDefaultLocale
          const rewriteLng = internal ? lng : config.fallbackLng
          const rewriteUrl = req.nextUrl.clone()
          rewriteUrl.pathname = `${prefix}/${rewriteLng}${pathAfterBase}`
          headers.set(config.headerName, rewriteLng)
          const response = NextResponse.rewrite(rewriteUrl, { request: { headers } })
          response.cookies.set(config.cookieName, rewriteLng, {
            path: '/',
            maxAge: config.cookieMaxAge,
            sameSite: 'lax',
          })
          return response
        }

        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = `${prefix}/${lng}${pathAfterBase}`
        const response = NextResponse.redirect(redirectUrl)
        response.cookies.set(config.cookieName, lng, {
          path: '/',
          maxAge: config.cookieMaxAge,
          sameSite: 'lax',
        })
        return response
      }

      // Persist language from referer URL into cookie
      const response = NextResponse.next({ request: { headers } })
      if (req.headers.has('referer')) {
        const refererUrl = new URL(req.headers.get('referer')!)
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
          response.cookies.set(config.cookieName, lngInReferer, {
            path: '/',
            maxAge: config.cookieMaxAge,
            sameSite: 'lax',
          })
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
