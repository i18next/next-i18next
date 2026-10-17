import Link from 'next/link'
import { getT } from 'next-i18next/server'
import { IcuTransWithoutContext } from 'react-i18next/IcuTransWithoutContext'
import i18nConfig from '../../i18n.config'
import { Cart } from './components/Cart'

// Server Component: getT() formats ICU messages with the server instance
export default async function Page() {
  const { t, i18n, lng } = await getT()

  return (
    <main>
      <h1>{t('title')}</h1>
      <p id='server-plural'>{t('photos', { count: 0 })} {t('photos', { count: 1 })} {t('photos', { count: 5 })}</p>
      <p id='server-select'>{t('order', { status: 'shipped' })}</p>
      <p id='server-rich'>
        <IcuTransWithoutContext
          i18nKey='welcome'
          defaultTranslation='Welcome back, <0>{name}</0>!'
          content={[{ type: 'strong' }]}
          values={{ name: 'Ada' }}
          t={t}
          i18n={i18n}
        />
      </p>
      <p id='server-where'>
        <IcuTransWithoutContext
          i18nKey='rendered'
          defaultTranslation='Rendered by a <0>{where}</0> Component.'
          content={[{ type: 'em' }]}
          values={{ where: 'Server' }}
          t={t}
          i18n={i18n}
        />
      </p>
      <Cart />
      <p>
        {t('switch')}{' '}
        {i18nConfig.supportedLngs.filter(l => l !== lng).map(l => (
          <Link key={l} href={`/${l}`}>{l}</Link>
        ))}
      </p>
    </main>
  )
}
