import Head from 'next/head'

export const Header = ({ heading, title }) => (
  <>
    <Head>
      <title>{title}</title>
    </Head>
    <h2>
      next-i18next
      <hr />
    </h2>
    <h1>
      {heading}
    </h1>
    <a
      className='github'
      href='//github.com/i18next/next-i18next'
    >
      <i className='typcn typcn-social-github-circular' />
    </a>
  </>
)
