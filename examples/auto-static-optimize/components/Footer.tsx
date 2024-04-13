import pkg from 'next-i18next/package.json'
import { useTranslation, Trans } from 'next-i18next'
import type { FC } from 'react'

export const Footer: FC = () => {
  const { t } = useTranslation('footer')

  return (
    <footer>
      <p>{t('description')}</p>
      <p>next-i18next v{pkg.version}</p>
      <p
        style={{
          fontSize: 'smaller',
          fontStyle: 'italic',
          marginTop: 20,
        }}
      >
        <Trans i18nKey="helpLocize" t={t}>
          With using
          <a href="https://locize.com" target="_new">
            locize
          </a>
          you directly support the future of
          <a href="https://www.i18next.com" target="_new">
            i18next
          </a>
          .
        </Trans>
      </p>
    </footer>
  )
}
