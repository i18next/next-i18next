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
import NextLink, { LinkProps } from 'next/link'
import { withTranslation } from 'react-i18next'

import { I18n, Config } from '../../types.d'
import { lngPathCorrector, localeSubpathRequired } from '../utils'

const removeWithTranslationProps = (props) => {
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

type Props = LinkProps & {
  i18n: I18n;
  nextI18NextInternals: {
    config: Config;
  };
}

class Link extends React.Component<Props> {
  static propTypes = {
    as: PropTypes.string,
    children: PropTypes.node.isRequired,
    href: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]).isRequired,
    nextI18NextInternals: PropTypes.shape({
      config: PropTypes.shape({
        defaultLanguage: PropTypes.string.isRequired,
        localeSubpaths: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  }

  static defaultProps = {
    as: undefined,
  }

  render() {
    const {
      as, children, href, i18n, nextI18NextInternals, ...props
    } = this.props
    const { language } = i18n

    if (localeSubpathRequired(nextI18NextInternals, language)) {
      const { config } = nextI18NextInternals
      const { as: correctedAs, href: correctedHref } = lngPathCorrector(
        config, { as, href }, language,
      )

      return (
        <NextLink
          href={correctedHref}
          as={correctedAs}
          {...removeWithTranslationProps(props)}
        >
          {children}
        </NextLink>
      )
    }

    return (
      <NextLink
        href={href}
        as={as}
        {...removeWithTranslationProps(props)}
      >
        {children}
      </NextLink>
    )
  }
}

/*
  Usage of `withTranslation` here is just to
  force `Link` to rerender on language change
*/
export default withTranslation()(Link as any)
