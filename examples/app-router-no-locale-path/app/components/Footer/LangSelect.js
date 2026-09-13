"use client"

import { useChangeLanguage } from 'next-i18next/client'
import { useRouter } from "next/navigation"

// languages comes from the i18next instance (i18n.options.supportedLngs), not from an
// import of i18n.config: that config is server code — it carries the resourceLoader —
// and importing it here would pull it into the browser bundle.
export const LangSelect = ({ currentLanguage, languages = [] }) => {
  const router = useRouter()
  const changeLanguage = useChangeLanguage()
  // i18next appends its 'cimode' debug language to supportedLngs
  const options = languages.filter((lang) => lang !== 'cimode' && lang !== currentLanguage)

  const handleChangeLanguage = (e, lang) => {
    e.preventDefault()
    changeLanguage(lang)
    router.refresh()
  }
  return (
    <div>
      {
        options.map((lang) => {
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
