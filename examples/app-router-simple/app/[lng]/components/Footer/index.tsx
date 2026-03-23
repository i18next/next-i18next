import { getT } from 'next-i18next/server'
import { FooterBase } from './FooterBase'

export const Footer = async ({ path }: {
  path?: string;
}) => {
  const { i18n, lng } = await getT('footer')
  return <FooterBase i18n={i18n} lng={lng} path={path} />
}
