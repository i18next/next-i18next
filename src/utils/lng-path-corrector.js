export default (config, i18n, currentRoute, currentLanguage = i18n.languages[0]) => {

  const { defaultLanguage, allLanguages } = config
  const { asPath, query } = currentRoute

  if (!allLanguages.includes(currentLanguage)) {
    throw new Error('Invalid configuration: Current language is not included in all languages array')
  }

  let as = asPath

  for (const lng of allLanguages) {
    if (asPath.startsWith(`/${lng}/`)) {
      as = as.replace(`/${lng}/`, '/')
      break
    }
  }

  if (currentLanguage !== defaultLanguage) {
    return [`/${currentLanguage}${as}`, { ...query, lng: currentLanguage }]
  }

  return [as, query]
}
