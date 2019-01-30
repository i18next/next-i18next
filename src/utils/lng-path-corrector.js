export default (config, i18n, currentRoute, currentLanguage = i18n.languages[0]) => {

  const { defaultLanguage, allLanguages } = config
  const { asPath, query } = currentRoute

  let as = asPath

  for (const lng of allLanguages) {
    if (asPath.startsWith(`/${lng}/`)) {
      as = as.replace(`/${lng}/`, '/')
      break
    }
  }

  if (currentLanguage === defaultLanguage || !allLanguages.includes(currentLanguage)) {
    return [as, query]
  }

  return [`/${currentLanguage}${as}`, { ...query, lng: currentLanguage }]
}
