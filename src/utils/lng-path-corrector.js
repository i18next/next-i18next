export default (config, i18n, currentRoute, currentLanguage = i18n.languages[0]) => {
  const { defaultLanguage, allLanguages, defaultLocaleSubpath } = config

  if (!allLanguages.includes(currentLanguage)) {
    return currentRoute
  }

  let href = currentRoute
  let as = href

  for (const lng of allLanguages) {
    if (href.startsWith(`/${lng}/`)) {
      href = href.replace(`/${lng}/`, '/')
      break
    }
  }

  if (currentLanguage !== defaultLanguage || defaultLocaleSubpath) {
    as = `/${currentLanguage}${href}`
    href += `?lng=${currentLanguage}`
  } else {
    as = href
  }

  return [href, as]
}
