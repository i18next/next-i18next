'use client'

import { LinkBase } from './LinkBase'
import { useT } from 'next-i18next/client'

export function Link({ href, children }: {
  href?: string;
  children?: React.ReactNode;
}) {
  const { i18n } = useT()
  return <LinkBase lng={i18n.resolvedLanguage} href={href}>{children}</LinkBase>
}
