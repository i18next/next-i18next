export default (nextI18NextConfig, lng) => {
  const { defaultLanguage, localeSubpaths } = nextI18NextConfig.config

  return localeSubpaths && lng && lng !== defaultLanguage
}
