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
import URI from 'urijs'

export default function () {

  const { config, i18n } = this

  class Link extends React.Component {
    render() {
      const { defaultLanguage, localeSubpaths } = config
      const { as, children, href } = this.props
      let lng = null
      if (Array.isArray(i18n.languages) && i18n.languages.length > 0) {
        [lng] = i18n.languages
      }
      if (localeSubpaths && lng && lng !== defaultLanguage) {
        const hrefWithLang = URI(href)
          .addQuery('lng', lng)
          .normalizeQuery()
          .toString()

        return (
          <NextLink href={hrefWithLang} as={`/${lng}${as || href}`}>
            {children}
          </NextLink>
        )
      }

      return <NextLink href={href} as={as}>{children}</NextLink>
    }
  }

  Link.propTypes = {
    as: PropTypes.string,
    children: PropTypes.node.isRequired,
    href: PropTypes.string.isRequired,
  }

  Link.defaultProps = {
    as: undefined,
  }

  /*
    Usage of `withNamespaces` here is just to
    force `Link` to rerender on language change
  */
  return this.withNamespaces()(Link)

}
