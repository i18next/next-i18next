import { getT } from 'next-i18next/server'
import { Trans } from 'react-i18next/TransWithoutContext'
import pkg from 'next-i18next/package.json'

export async function FooterServer({ locale }: { locale: string }) {
  const { t, i18n } = await getT('footer', { lng: locale })

  return (
    <footer>
      <p>{t('description')}</p>
      <p>next-i18next v{pkg.version}</p>
      <p style={{ fontSize: 'smaller', fontStyle: 'italic', marginTop: 20 }}>
        <Trans i18nKey="helpLocize" t={t} i18n={i18n}>
          With using
          <a href="https://www.locize.com" target="_new">locize</a>
          you directly support the future of
          <a href="https://www.i18next.com" target="_new">i18next</a>.
        </Trans>
      </p>
    </footer>
  )
}
