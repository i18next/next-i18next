'use client'

import { FooterBase } from './FooterBase'
import { useT } from 'next-i18next/client'

export const Footer = ({ path }) => {
  const { t, i18n } = useT('footer')
  return <FooterBase t={t} i18n={i18n} path={path} attachOnClick/>
}
