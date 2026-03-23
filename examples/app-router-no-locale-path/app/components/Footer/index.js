import { FooterBase } from './FooterBase'
import { getT } from 'next-i18next/server'

export const Footer = async ({ path }) => {
  const { t, i18n, lng } = await getT('footer')
  return <FooterBase t={t} i18n={i18n} lng={lng} path={path} />
}
