import i18nextMiddleware from 'i18next-express-middleware'
import { forceTrailingSlash, lngPathDetector } from 'utils'

export default function (app, server) {

  const { config, i18n } = this
  const { allLanguages, localeSubpaths } = config

  server.use(i18nextMiddleware.handle(i18n))

  if (localeSubpaths) {
    server.get('*', forceTrailingSlash)
    server.get(/^\/(?!_next|static).*$/, lngPathDetector)
    server.get(`/:lng(${allLanguages.join('|')})/*`, (req, res) => {
      const { lng } = req.params
      app.render(req, res, req.url.replace(`/${lng}`, ''), { lng })
    })
  }
}
