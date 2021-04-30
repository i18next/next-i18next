import { version } from 'next-i18next/package.json'
import { i18n, useTranslation } from 'next-i18next'

export const Footer = () => {

  const { t } = useTranslation('footer', {i18n})

  return (
    <footer>
      <p>
        {t('description')}
      </p>
      <p>
        next-i18next v
        {version}
      </p>
    </footer>
  )
}
