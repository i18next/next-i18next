import Head from 'next/head'
import type { FC } from 'react'
import Link from 'next/link'

type Props = {
  heading: string
  title: string
}

export const Header: FC<Props> = ({ heading, title }) => (
  <>
    <Head>
      <title>{title}</title>
    </Head>
    <h2>
      next-i18next
      <hr />
    </h2>
    <h1>{heading}</h1>
    <Link className="github" href="https://github.com/i18next/next-i18next">
      <i className="typcn typcn-social-github-circular" />
    </Link>
  </>
)
