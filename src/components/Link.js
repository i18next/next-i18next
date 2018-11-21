/*
  This `Link` component is a wrap of the standard
  NextJs `Link` component, with some simple lang
  redirect logic in place.

  If you haven't already, read this issue comment:
  https://github.com/zeit/next.js/issues/2833#issuecomment-414919347

  This component automatically provides this functionality:
  <Link href="/product?slug=something" as="/products/something">

  Wherein `slug` is actually our i18n lang, and it gets
  pulled automatically.

  Very important: if you import `Link` from NextJs directly,
  and not this file, your lang subpath routing will break.
*/

import React from 'react'
import PropTypes from 'prop-types'
import NextLink from 'next/link'

export default function () {

  const { config, i18n } = this

  class Link extends React.Component {
    render() {
      const { defaultLanguage, localeSubpaths } = config
      const { children, href } = this.props
      const lng = i18n.languages[0]
      if (localeSubpaths && lng !== defaultLanguage) {
        return (
          <NextLink href={`${href}?lng=${lng}`} as={`/${lng}${href}`}>
            {children}
          </NextLink>
        )
      }
      return <NextLink href={href}>{children}</NextLink>
    }
  }

  Link.propTypes = {
    children: PropTypes.node.isRequired,
    href: PropTypes.string.isRequired,
  }

  /*
    Usage of `withNamespaces` here is just to
    force `Link` to rerender on language change
  */
  return this.withNamespaces()(Link)

}
