"use client"

import { useChangeLanguage } from 'next-i18next/client'
import { useRouter } from "next/navigation"
import i18nConfig from "../../../i18n.config"

const languages = i18nConfig.supportedLngs

export const LangSelect = ({ currentLanguage }) => {
  const router = useRouter()
  const changeLanguage = useChangeLanguage()

  const handleChangeLanguage = (e, lang) => {
    e.preventDefault()
    changeLanguage(lang)
    router.refresh()
  }
  return (
    <div>
      {
        languages.map((lang, index) => {
          if (lang === currentLanguage) {
            return null
          }
          return (
            <span key={lang}>
              <button onClick={(e) => handleChangeLanguage(e, lang)} type="button">{lang}</button>
            </span>
          )
        })
      }
    </div>
  )
}
