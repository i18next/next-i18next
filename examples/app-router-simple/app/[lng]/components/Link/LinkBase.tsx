import Link from 'next/link'
import { ReactNode } from 'react'
import i18nConfig from '../../../../i18n.config'

const fallbackLng = i18nConfig.fallbackLng

export const LinkBase = ({ lng = fallbackLng, href = '', children }: { lng?: string; href?: string; children: ReactNode }) => {
  return <Link href={`/${lng}${href.startsWith('/') ? href : `/${href}`}`}>{children}</Link>
}
