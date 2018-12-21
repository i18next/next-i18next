export default (config, i18n, currentRoute, currentLanguage = i18n.languages[0]) => {

  const { defaultLanguage, allLanguages } = config

  if (!allLanguages.includes(currentLanguage)) {
    throw new Error('Invalid configuration: Current language is not included in all languages array')
  }

  let href = currentRoute
  let as = href

  for (const lng of allLanguages) {
    if (href.startsWith(`/${lng}/`)) {
      href = href.replace(`/${lng}/`, '/')
      break
    }
  }

  if (currentLanguage !== defaultLanguage) {
    as = `/${currentLanguage}${href}`
    href += `?lng=${currentLanguage}`
  } else {
    as = href
  }

  return [href, as]
}
