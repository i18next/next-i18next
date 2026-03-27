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
    const { pathname, search } = req.nextUrl

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

      // hideDefaultLocale: redirect explicit default-locale paths to the clean URL
      if (config.hideDefaultLocale && lngInPath === config.fallbackLng) {
        const pathWithoutLocale = pathAfterBase.replace(/^\/[^/]+/, '') || '/'
        const redirectUrl = new URL(`${prefix}${pathWithoutLocale}${search}`, req.url)
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
        if (config.hideDefaultLocale) {
          // Rewrite internally to the default-locale path, keeping the clean URL
          const rewriteUrl = new URL(`${prefix}/${config.fallbackLng}${pathAfterBase}${search}`, req.url)
          headers.set(config.headerName, config.fallbackLng)
          const response = NextResponse.rewrite(rewriteUrl, { request: { headers } })
          response.cookies.set(config.cookieName, config.fallbackLng, {
            path: '/',
            maxAge: config.cookieMaxAge,
            sameSite: 'lax',
          })
          return response
        }

        const redirectUrl = new URL(`${prefix}/${lng}${pathAfterBase}${search}`, req.url)
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
        const refererPathForLocale = basePath
          ? refererUrl.pathname.slice(basePath.length) || '/'
          : refererUrl.pathname
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
