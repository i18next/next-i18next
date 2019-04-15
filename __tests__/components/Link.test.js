/* eslint-env jest */

import React from 'react'
import { mount } from 'enzyme'

import Link from '../../src/components/Link'
import { localeSubpathOptions } from '../../src/config/default-config'

jest.mock('next/link')
jest.mock('react-i18next', () => ({
  withNamespaces: () => Component => Component,
}))

describe('Link component', () => {
  let props

  beforeEach(() => {
    props = {
      href: '/foo/bar',
      lng: 'de',
      nextI18NextInternals: {
        config: {
          allLanguages: ['en', 'de'],
          defaultLanguage: 'en',
          localeSubpaths: localeSubpathOptions.NONE,
        },
      },
    }
  })

  const createLinkComponent = (otherProps = {}) => mount(
    <Link {...props} {...otherProps}>click here</Link>,
  ).find('Link').at(1)

  it(`renders without lang if localeSubpaths is "${localeSubpathOptions.NONE}"`, () => {
    // without 'as' prop
    let component = createLinkComponent()

    expect(component.prop('href')).toEqual('/foo/bar')
    expect(component.prop('as')).toBeUndefined()

    // with 'as' prop
    props.as = '/foo?bar'
    component = createLinkComponent()

    expect(component.prop('href')).toEqual('/foo/bar')
    expect(component.prop('as')).toEqual('/foo?bar')
  })

  it('renders without lang if props.lng is undefined', () => {
    props.nextI18NextInternals.config.localeSubpaths = localeSubpathOptions.FOREIGN
    props.lng = undefined

    // without 'as' prop
    let component = createLinkComponent()

    expect(component.prop('href')).toEqual('/foo/bar')
    expect(component.prop('as')).toBeUndefined()

    // with 'as' prop
    props.as = '/foo?bar'
    component = createLinkComponent()

    expect(component.prop('href')).toEqual('/foo/bar')
    expect(component.prop('as')).toEqual('/foo?bar')
  })

  it('renders without lang if props.lng === defaultLanguage', () => {
    props.nextI18NextInternals.config.localeSubpaths = localeSubpathOptions.FOREIGN
    props.nextI18NextInternals.config.defaultLanguage = 'en'
    props.lng = 'en'

    // without 'as' prop
    let component = createLinkComponent()

    expect(component.prop('href')).toEqual('/foo/bar')
    expect(component.prop('as')).toBeUndefined()

    // with 'as' prop
    props.as = '/foo?bar'
    component = createLinkComponent()

    expect(component.prop('href')).toEqual('/foo/bar')
    expect(component.prop('as')).toEqual('/foo?bar')
  })

  it('renders with lang', () => {
    props.nextI18NextInternals.config.localeSubpaths = localeSubpathOptions.FOREIGN
    props.nextI18NextInternals.config.defaultLanguage = 'en'

    // without 'as' prop -- no query parameters
    let component = createLinkComponent()

    expect(component.prop('href')).toEqual(
      expect.objectContaining({ pathname: '/foo/bar', query: { lng: 'de' } }),
    )
    expect(component.prop('as')).toEqual('/de/foo/bar')

    // without 'as' prop -- query parameters
    props.href = '/foo/bar?baz'
    component = createLinkComponent()

    expect(component.prop('href')).toEqual(
      expect.objectContaining({ pathname: '/foo/bar', query: { baz: '', lng: 'de' } }),
    )
    expect(component.prop('as')).toEqual('/de/foo/bar?baz')

    props.href = '/foo/bar'

    // with 'as' prop
    props.as = '/foo?bar'
    component = createLinkComponent()

    expect(component.prop('href')).toEqual(
      expect.objectContaining({ pathname: '/foo/bar', query: { lng: 'de' } }),
    )
    expect(component.prop('as')).toEqual('/de/foo?bar')
  })

  it('handles full URLs', () => {
    props.nextI18NextInternals.config.localeSubpaths = localeSubpathOptions.FOREIGN
    props.nextI18NextInternals.config.defaultLanguage = 'en'

    // without 'as' prop -- query parameters
    props.href = 'https://my-website.com/foo/bar?baz'
    const component = createLinkComponent(props)

    expect(component.prop('href')).toEqual(
      expect.objectContaining({ pathname: '/foo/bar', query: { baz: '', lng: 'de' } }),
    )
    expect(component.prop('as')).toEqual('/de/foo/bar?baz')
  })

  describe('https://github.com/isaachinman/next-i18next/issues/89', () => {
    describe('when href is an object, properly parse it', () => {
      beforeEach(() => {
        props.href = {
          pathname: '/foo/bar',
          query: {},
        }
      })

      describe(`localeSubpaths = "${localeSubpathOptions.NONE}"`, () => {
        beforeEach(() => {
          props.nextI18NextInternals.config.localeSubpaths = localeSubpathOptions.NONE
        })

        it('renders without lang', () => {
          const component = createLinkComponent()

          expect(component.prop('href')).toEqual({ pathname: '/foo/bar', query: {} })
          expect(component.prop('as')).toBeUndefined()
        })

        it('renders without lang (with "as" prop)', () => {
          props.as = '/foo?bar'

          const component = createLinkComponent()

          expect(component.prop('href')).toEqual({ pathname: '/foo/bar', query: {} })
          expect(component.prop('as')).toEqual('/foo?bar')
        })
      })

      describe(`localeSubpaths = "${localeSubpathOptions.FOREIGN}"`, () => {
        beforeEach(() => {
          props.nextI18NextInternals.config.localeSubpaths = localeSubpathOptions.FOREIGN
        })

        beforeEach(() => {
          props.nextI18NextInternals.config.defaultLanguage = 'en'

          props.href = { pathname: '/foo/bar', query: {} }
        })

        it('renders with lang', () => {
          const component = createLinkComponent()

          expect(component.prop('href')).toEqual({ pathname: '/foo/bar', query: { lng: 'de' } })
          expect(component.prop('as')).toEqual('/de/foo/bar')
        })

        it('renders with lang (with "as" prop)', () => {
          props.as = '/foo?bar'

          const component = createLinkComponent()

          expect(component.prop('href')).toEqual({ pathname: '/foo/bar', query: { lng: 'de' } })
          expect(component.prop('as')).toEqual('/de/foo?bar')
        })

        it('renders with lang (with query parameters)', () => {
          props.href.query = { baz: '' }

          const component = createLinkComponent()

          expect(component.prop('href'))
            .toEqual({ pathname: '/foo/bar', query: { baz: '', lng: 'de' } })
          expect(component.prop('as')).toEqual('/de/foo/bar?baz=')
        })
      })
    })
  })

  describe('https://github.com/isaachinman/next-i18next/issues/97', () => {
    const withNamespacesPropNames = [
      'defaultNS',
      'i18n',
      'i18nOptions',
      'lng',
      'reportNS',
      't',
      'tReady',
    ]

    it('strips withNamespaces props before passing props to NextLink', () => {
      const withNamespacesProps = withNamespacesPropNames.reduce((accum, propName, index) => {
        // eslint-disable-next-line no-param-reassign
        accum[propName] = index

        return accum
      }, {})

      const component = createLinkComponent(withNamespacesProps)

      withNamespacesPropNames.forEach((propName) => {
        expect(component.prop(propName)).toBeUndefined()
      })
    })
  })
})
