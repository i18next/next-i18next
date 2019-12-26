import { parse as parseUrl } from 'url'

export const subpathIsPresent = (url: string, subpath: string) => {
  if (typeof url !== 'string' || typeof subpath !== 'string') {
    return false
  }

  const { pathname } = parseUrl(url)
  return typeof pathname === 'string' && (
    (pathname.length === subpath.length + 1 && pathname === `/${subpath}`) ||
    (pathname.startsWith(`/${subpath}/`))
  )
}
