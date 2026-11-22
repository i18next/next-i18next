import { FooterBase } from './FooterBase'
import { getT } from '@/i18n.server'

export const Footer = async ({ path }) => {
  const { t, i18n, lng } = await getT('footer')
  return <FooterBase t={t} i18n={i18n} lng={lng} path={path} />
}
