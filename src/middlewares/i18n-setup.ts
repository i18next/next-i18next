export default (i18n, config) => {
  const i18nextNodeBackend = eval("require('i18next-node-fs-backend')")
  const i18nextMiddleware = eval("require('i18next-express-middleware')")
  i18n.use(i18nextNodeBackend)
  if (config.serverLanguageDetection) {
    const serverDetectors = new i18nextMiddleware.LanguageDetector()
    config.customDetectors.forEach(detector => serverDetectors.addDetector(detector))
    i18n.use(serverDetectors)
  }
}