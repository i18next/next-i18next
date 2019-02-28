export default (nextI18NextConfig, lng) => {
  const { defaultLanguage, localeSubpaths, defaultLocaleSubpath } = nextI18NextConfig.config

  return localeSubpaths && lng && (lng !== defaultLanguage || defaultLocaleSubpath)
}
