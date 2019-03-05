export default (req) => {

  if (!req.i18n) {
    return null
  }

  const { allLanguages, defaultLanguage, fallbackLng } = req.i18n.options

  const fallback = fallbackLng || defaultLanguage

  if (!req.i18n.languages) {
    return fallback
  }

  const language = req.i18n.languages.find(l => allLanguages.includes(l))
    || fallback

  return language

}
