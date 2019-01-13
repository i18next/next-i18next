import { parse } from 'url'
import { redirectWithoutCache } from 'utils'

export default (req, res, lng) => {
  const { pathname, search } = parse(req.url)
  redirectWithoutCache(res, pathname.replace(`/${lng}`, `/${lng}/`) + (search || ''))
}
