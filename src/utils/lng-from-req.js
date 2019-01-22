export default (req) => {
  const { allLanguages, defaultLanguage, fallbackLng } = req.i18n.options

  const language = req.i18n.languages.find(l => req.i18n.language || allLanguages.includes(l))
    || fallbackLng
    || defaultLanguage

  return language
}
