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
import { withNamespaces } from 'react-i18next'
import { format as formatUrl } from 'url'
import { lngPathCorrector, parseHref, localeSubpathRequired } from '../utils'

const removeWithNamespacesProps = (props) => {
  const strippedProps = Object.assign({}, props)
  delete strippedProps.defaultNS
  delete strippedProps.i18n
  delete strippedProps.i18nOptions
  delete strippedProps.lng
  delete strippedProps.reportNS
  delete strippedProps.t
  delete strippedProps.tReady
  return strippedProps
}

class Link extends React.Component {
  render() {
    const {
      as, children, href: hrefProp, lng, nextI18NextConfig, ...props
    } = this.props

    if (localeSubpathRequired(nextI18NextConfig, lng)) {
      const { config } = nextI18NextConfig
      const href = parseHref(hrefProp)
      const { pathname, query } = href

      const asPath = as || formatUrl(href, { unicode: true })
      const [correctedAs, correctedQuery] = lngPathCorrector(config, [], { asPath, query }, lng)

      return (
        <NextLink
          href={{ pathname, query: correctedQuery }}
          as={correctedAs}
          {...removeWithNamespacesProps(props)}
        >
          {children}
        </NextLink>
      )
    }

    return (
      <NextLink
        href={hrefProp}
        as={as}
        {...removeWithNamespacesProps(props)}
      >
        {children}
      </NextLink>
    )
  }
}

Link.propTypes = {
  as: PropTypes.string,
  children: PropTypes.node.isRequired,
  href: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]).isRequired,
  nextI18NextConfig: PropTypes.shape({
    config: PropTypes.shape({
      defaultLanguage: PropTypes.string.isRequired,
      localeSubpaths: PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
}

Link.defaultProps = {
  as: undefined,
}

/*
  Usage of `withNamespaces` here is just to
  force `Link` to rerender on language change
*/
export default withNamespaces()(Link)
