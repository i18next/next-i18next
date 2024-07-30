import Head from 'next/head'

export const Header = ({ heading, title }) => (
  <>
    <Head>
      <title>{title}</title>
    </Head>
    <h2>
      next-language-detector example
      <hr />
    </h2>
    <h1>{heading}</h1>
    <a
      className="github"
      href="https://github.com/i18next/next-language-detector"
    >
      <i className="typcn typcn-social-github-circular" />
    </a>
  </>
)
