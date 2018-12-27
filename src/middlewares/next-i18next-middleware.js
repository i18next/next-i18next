import i18nextMiddleware from 'i18next-express-middleware'
import { forceTrailingSlash, lngPathDetector } from 'utils'
import { parse } from 'url'

export default function (nexti18next, app, server) {

  const { config, i18n } = nexti18next
  const { allLanguages, ignoreRoutes, localeSubpaths } = config

  server.use(i18nextMiddleware.handle(i18n, { ignoreRoutes }))

  const ignoreRegex = new RegExp(`^\/(?!${ignoreRoutes.map(x => x.replace('/', '')).join('|')}).*$`)

  if (localeSubpaths) {
    server.get(ignoreRegex, forceTrailingSlash)
    server.get(ignoreRegex, lngPathDetector)
    server.get(`/:lng(${allLanguages.join('|')})/*`, (req, res) => {
      const { lng } = req.params
      const { query } = req
      const url = parse(req.url).pathname
      app.render(req, res, url.replace(`/${lng}`, ''), { lng, ...query })
    })
  }
}
