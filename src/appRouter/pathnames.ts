import type { I18nConfig, Pathnames } from './types'
import { normalizeConfig } from './config'

// Translated URL paths (`pathnames` config): pure helpers shared by the proxy and the
// root export, so they stay Edge- and client-safe (no next/server, no react).

type Params = Record<string, string>

const compiled = new Map<string, { regex: RegExp, names: string[] }>()

// '/blog/[slug]' -> /^\/blog\/([^/]+)$/, '/docs/[...path]' -> /^\/docs\/(.+)$/
function compile(pattern: string) {
  let entry = compiled.get(pattern)
  if (!entry) {
    const names: string[] = []
    const source = pattern
      .split(/(\[\.\.\.[^\]]+\]|\[[^\]]+\])/)
      .map((part) => {
        const catchAll = part.match(/^\[\.\.\.([^\]]+)\]$/)
        if (catchAll) { names.push(catchAll[1]); return '(.+)' }
        const param = part.match(/^\[([^\]]+)\]$/)
        if (param) { names.push(param[1]); return '([^/]+)' }
        return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      })
      .join('')
    entry = { regex: new RegExp(`^${source}$`), names }
    compiled.set(pattern, entry)
  }
  return entry
}

function match(pattern: string, path: string): Params | undefined {
  const { regex, names } = compile(pattern)
  // nextUrl.pathname is percent-encoded (/%C3%BCber-uns) and has a trailing slash with
  // `trailingSlash: true`; NextURL encodes and adds the slash again on the way out
  let decoded = path
  try { decoded = decodeURI(path) } catch {}
  if (decoded.length > 1 && decoded.endsWith('/')) decoded = decoded.slice(0, -1)
  const m = decoded.match(regex)
  if (!m) return undefined
  const params: Params = {}
  names.forEach((name, i) => { params[name] = m[i + 1] })
  return params
}

function fill(pattern: string, params: Params): string {
  return pattern.replace(/\[(?:\.\.\.)?([^\]]+)\]/g, (_, name) => params[name] ?? '')
}

const PARAM = /\[(\.\.\.)?([^\]]+)\]/g
const kind = (pattern: string) => (pattern.includes('[...') ? 2 : pattern.includes('[') ? 1 : 0)
const ordered = new WeakMap<Pathnames, string[]>()

// static routes first, then [param], then [...param], as Next.js matches them
function routes(pathnames: Pathnames): string[] {
  let list = ordered.get(pathnames)
  if (!list) {
    list = Object.keys(pathnames).sort((a, b) => kind(a) - kind(b))
    ordered.set(pathnames, list)
  }
  return list
}

/** Throws for a `pathnames` entry whose translations use other params than its route. */
export function validatePathnames(pathnames: Pathnames): void {
  const params = (pattern: string) => [...pattern.matchAll(PARAM)].map((m) => `${m[1] ?? ''}${m[2]}`).sort().join(',')
  for (const internal of Object.keys(pathnames)) {
    for (const [lng, localized] of Object.entries(pathnames[internal])) {
      for (const pattern of [internal, localized]) {
        if (pattern.includes('[[')) {
          throw new Error(`next-i18next: optional catch-all segments ([[...param]]) are not supported in pathnames ('${pattern}')`)
        }
        if (!pattern.startsWith('/')) {
          throw new Error(`next-i18next: pathnames must start with '/' ('${pattern}')`)
        }
      }
      if (params(internal) !== params(localized)) {
        throw new Error(`next-i18next: pathnames['${internal}'].${lng} ('${localized}') must use the same params as '${internal}'`)
      }
    }
  }
}

/** The internal route for a public path in `lng` ('/kontakt' -> '/contact'), if it is a translated one. */
export function toInternalPath(path: string, lng: string, pathnames?: Pathnames): string | undefined {
  if (!pathnames) return undefined
  for (const internal of routes(pathnames)) {
    const localized = pathnames[internal][lng]
    if (!localized) continue
    const params = match(localized, path)
    if (params) return fill(internal, params)
  }
  return undefined
}

/** The public path in `lng` for an internal route ('/contact' -> '/kontakt'); unchanged without a translation. */
export function toLocalizedPath(path: string, lng: string, pathnames?: Pathnames): string {
  if (!pathnames) return path
  for (const internal of routes(pathnames)) {
    const localized = pathnames[internal][lng]
    if (!localized) continue
    const params = match(internal, path)
    if (params) return fill(localized, params)
  }
  return path
}

function basePrefix(basePath?: string) {
  return basePath ? '/' + basePath.replace(/^\/+/, '').replace(/\/+$/, '') : ''
}

/**
 * The public path of an internal route in a language, with the locale prefix and `basePath`:
 * `getLocalizedPath('/contact', 'de', config)` -> `'/de/kontakt'`. For links, a language
 * switcher (together with `getInternalPath`) and hreflang alternates.
 */
export function getLocalizedPath(path: string, lng: string, userConfig: I18nConfig): string {
  const config = normalizeConfig(userConfig)
  // as in the proxy: translated paths only with the locale in the URL
  const localized = toLocalizedPath(path, lng, config.localeInPath === true ? config.pathnames : undefined)
  const prefix = basePrefix(config.basePath)
  if (config.localeInPath !== true || (config.hideDefaultLocale && lng === config.fallbackLng)) {
    return prefix && localized === '/' ? prefix : `${prefix}${localized}`
  }
  return `${prefix}/${lng}${localized === '/' ? '' : localized}`
}

/**
 * The language and internal route of a public path: `getInternalPath('/de/kontakt', config)`
 * -> `{ lng: 'de', path: '/contact' }`. `lng` is undefined when the path has no locale prefix
 * (and is the default language with `hideDefaultLocale`).
 */
export function getInternalPath(pathname: string, userConfig: I18nConfig): { lng?: string, path: string } {
  const config = normalizeConfig(userConfig)
  const prefix = basePrefix(config.basePath)
  const path = prefix && (pathname === prefix || pathname.startsWith(prefix + '/'))
    ? pathname.slice(prefix.length) || '/'
    : pathname
  const segment = path.match(/^\/([^/]+)/)?.[1]
  let lng = segment && config.supportedLngs.find((l) => l.toLowerCase() === segment.toLowerCase())
  let rest = path
  if (lng) rest = path.slice(segment!.length + 1) || '/'
  else if (config.hideDefaultLocale) lng = config.fallbackLng
  if (!lng) return { path }
  const pathnames = config.localeInPath === true ? config.pathnames : undefined
  return { lng, path: toInternalPath(rest, lng, pathnames) ?? rest }
}
