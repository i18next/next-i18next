import i18nextMiddleware from 'i18next-express-middleware'

// import { forceTrailingSlash, lngPathDetector } from 'utils'

export default function (app, server) {
  server.use(i18nextMiddleware.handle(this.i18n))

  // const { allLanguages } = i18n.options

  // if (i18n.options.localeSubpaths) {
  //   server.get('*', forceTrailingSlash)
  //   server.get(/^\/(?!_next|static).*$/, lngPathDetector)
  //   server.get(`/:lng(${allLanguages.join('|')})/*`, (req, res) => {
  //     const { lng } = req.params
  //     app.render(req, res, req.url.replace(`/${lng}`, ''), { lng })
  //   })
  // }
}
