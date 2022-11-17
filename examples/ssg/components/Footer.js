import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import LanguageSwitchLink from './LanguageSwitchLink'
import pkg from 'next-i18next/package.json'
import pkgLD from 'next-language-detector/package.json'

import i18nextConfig from '../next-i18next.config'

export const Footer = () => {
  const router = useRouter()
  const { t } = useTranslation('footer')
  const currentLocale =
    router.query.locale || i18nextConfig.i18n.defaultLocale

  return (
    <footer>
      <p>{t('description')}</p>
      <p>
        <span style={{ fontSize: 'small', lineHeight: '4.65em' }}>
          {t('change-locale')}
        </span>
        {i18nextConfig.i18n.locales.map(locale => {
          if (locale === currentLocale) return null
          return <LanguageSwitchLink locale={locale} key={locale} />
        })}
      </p>
      <p>next-i18next v{pkg.version}</p>
      <p>next-language-detector v{pkgLD.version}</p>
    </footer>
  )
}
