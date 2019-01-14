/* eslint-env jest */

import React from 'react'
import { mount } from 'enzyme'

import Link from '../../src/components/Link'

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
      nextI18NextConfig: {
        config: {
          defaultLanguage: 'en',
          localeSubpaths: false,
        },
      },
    }
  })

  const createLinkComponent = (otherProps = {}) => mount(
    <Link {...props} {...otherProps}>click here</Link>,
  ).find('Link').at(1)

  describe('localeSubpaths === false', () => {
    describe('href as string', () => {
      beforeEach(() => {
        props.href = '/foo/bar'
      })

      it('renders without lang', () => {
        const component = createLinkComponent()

        expect(component.prop('href')).toEqual('/foo/bar')
        expect(component.prop('as')).toBeUndefined()
      })

      it('renders without lang (with "as" prop)', () => {
        props.as = '/foo?bar'

        const component = createLinkComponent()

        expect(component.prop('href')).toEqual('/foo/bar')
        expect(component.prop('as')).toEqual('/foo?bar')
      })
    })

    describe('href as object', () => {
      beforeEach(() => {
        props.href = {
          pathname: '/foo/bar',
          query: {},
        }
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
  })

  describe('localeSubpaths === true', () => {
    beforeEach(() => {
      props.nextI18NextConfig.config.localeSubpaths = true
    })

    it('renders without lang if props.lng is undefined', () => {
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
      props.nextI18NextConfig.config.defaultLanguage = 'en'
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

    describe('href as string', () => {
      beforeEach(() => {
        props.nextI18NextConfig.config.defaultLanguage = 'en'

        props.href = '/foo/bar'
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
        props.href = '/foo/bar?baz'

        const component = createLinkComponent()

        expect(component.prop('href'))
          .toEqual({ pathname: '/foo/bar', query: { baz: '', lng: 'de' } })
        expect(component.prop('as')).toEqual('/de/foo/bar?baz')
      })
    })

    describe('href as an object', () => {
      beforeEach(() => {
        props.nextI18NextConfig.config.defaultLanguage = 'en'

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
