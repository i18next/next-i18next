import React from 'react'
import { getT } from 'next-i18next/server'
import { LinkBase } from './LinkBase'

export const Link = async ({ href, children }: {
  href?: string;
  children?: React.ReactNode;
}) => {
  const { lng } = await getT()
  return <LinkBase lng={lng} href={href}>{children}</LinkBase>
}
