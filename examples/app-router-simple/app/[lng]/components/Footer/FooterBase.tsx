import { i18n } from 'i18next'
import Link from 'next/link'
import { Trans } from 'react-i18next/TransWithoutContext'
import i18nConfig from '../../../../i18n.config'

const languages = i18nConfig.supportedLngs
const fallbackLng = i18nConfig.fallbackLng

export const FooterBase = ({ i18n, lng = fallbackLng, path = '' }: { i18n: i18n, lng?: string, path?: string }) => {
  const t = i18n.getFixedT(lng, 'footer')
  return (
    <footer>
      <Trans i18nKey="languageSwitcher" t={t} i18n={i18n}>
        {/* @ts-expect-error Trans interpolation */}
        Switch from <strong>{{lng}}</strong> to:{' '}
      </Trans>
      {languages.filter((l) => lng !== l).map((l, index) => {
        return (
          <span key={l}>
            {index > 0 && (' or ')}
            <Link href={`/${l}${path}`}>
              {l}
            </Link>
          </span>
        )
      })}
      <p>{t('description')}</p>
      <p
        style={{
          fontSize: 'smaller',
          fontStyle: 'italic',
          marginTop: 20,
        }}
      >
        <Trans i18nKey="helpLocize" t={t} i18n={i18n}>
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
