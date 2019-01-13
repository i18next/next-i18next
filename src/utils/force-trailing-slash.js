import { parse } from 'url'
import { redirectWithoutCache } from 'utils'

export default (allLanguages, req, res) => {
  const { pathname, search } = parse(req.url)
  return allLanguages.some((lng) => {
    if (pathname === `/${lng}`) {
      redirectWithoutCache(res, pathname.replace(`/${lng}`, `/${lng}/`) + (search || ''))

      return true
    }

    return false
  })
}
