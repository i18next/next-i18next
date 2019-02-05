export default (req) => {

  const { allLanguages, defaultLanguage, fallbackLng } = req.i18n.options

  if (Array.isArray(req.i18n.languages) && req.i18n.languages.some(l => allLanguages.includes(l))) {
    return req.i18n.languages.find(l => allLanguages.includes(l))
  }

  return fallbackLng[0] || defaultLanguage
}
