import React from 'react'
import PropTypes from 'prop-types'

import Head from 'next/head'

const Header = ({ title }) => (
  <React.Fragment>
    <Head>
      <title>next-i18next</title>

      <link href="https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.min.css" rel="stylesheet" />
      <link href="/static/app.css" rel="stylesheet" />

      <link href="https://cdnjs.cloudflare.com/ajax/libs/typicons/2.0.9/typicons.min.css" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400|Oswald:600" rel="stylesheet" />
      <link data-react-helmet="true" rel="icon" href="https://blobscdn.gitbook.com/v0/b/gitbook-28427.appspot.com/o/spaces%2F-L9iS6Wm2hynS5H9Gj7j%2Favatar.png?generation=1523462254548780&amp;alt=media" />
    </Head>
    <h2>
      next-i18next
      <hr />
    </h2>
    <h1>
      {title}
    </h1>
    <a
      className="github"
      href="//github.com/isaachinman/next-i18next"
    >
      <i className="typcn typcn-social-github-circular" />
    </a>
  </React.Fragment>
)

Header.propTypes = {
  title: PropTypes.string.isRequired,
}

export default Header
