import { Request } from 'express'

export default (req: Request) => {

  if (!req.i18n) {
    return null
  }

  const { allLanguages, defaultLanguage, fallbackLng } = req.i18n.options
  const fallback = fallbackLng || defaultLanguage

  if (!req.i18n.languages) {
    return typeof fallback === 'string' ? fallback : null
  }

  const language = req.i18n.languages.find(l => allLanguages.includes(l))
    || fallback

  if (typeof language === 'string') {
    return language
  }
  
  return null

}
