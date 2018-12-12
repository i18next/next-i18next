/* eslint-env jest */

import React from 'react'
import { mount } from 'enzyme'

import linkFunction from '../../src/components/Link'

jest.mock('next/link')

describe('Link component', () => {
  let context
  let props

  beforeEach(() => {
    context = {}

    context.config = {
      defaultLanguage: 'en',
      localeSubpaths: false,
    }

    context.i18n = {
      languages: ['fr', 'en'],
    }

    context.withNamespaces = () => Component => Component

    props = {
      href: '/foo/bar',
    }
  })

  const createLinkComponent = () => {
    const Link = linkFunction.apply(context)

    return mount(<Link {...props}>click here</Link>).find('Link').at(1)
  }

  it('renders without lang if localeSubpaths === false', () => {
    // without 'as' prop
    let component = createLinkComponent()

    expect(component.prop('href')).toEqual('/foo/bar')
    expect(component.prop('as')).toBeNull()

    // with 'as' prop
    props.as = '/foo?bar'
    component = createLinkComponent()

    expect(component.prop('href')).toEqual('/foo/bar')
    expect(component.prop('as')).toEqual('/foo?bar')
  })

  it('renders without lang if !Array.isArray(i18n.languages)', () => {
    context.config.localeSubpaths = true
    context.i18n.languages = null

    // without 'as' prop
    let component = createLinkComponent()

    expect(component.prop('href')).toEqual('/foo/bar')
    expect(component.prop('as')).toBeNull()

    // with 'as' prop
    props.as = '/foo?bar'
    component = createLinkComponent()

    expect(component.prop('href')).toEqual('/foo/bar')
    expect(component.prop('as')).toEqual('/foo?bar')
  })

  it('renders without lang if i18n.languages.length === 0', () => {
    context.config.localeSubpaths = true
    context.i18n.languages = []

    // without 'as' prop
    let component = createLinkComponent()

    expect(component.prop('href')).toEqual('/foo/bar')
    expect(component.prop('as')).toBeNull()

    // with 'as' prop
    props.as = '/foo?bar'
    component = createLinkComponent()

    expect(component.prop('href')).toEqual('/foo/bar')
    expect(component.prop('as')).toEqual('/foo?bar')
  })

  it('renders without lang if i18n.languages[0] === defaultLanguage', () => {
    context.config.localeSubpaths = true
    context.config.defaultLanguage = 'en'
    context.i18n.languages = ['en', 'fr']

    // without 'as' prop
    let component = createLinkComponent()

    expect(component.prop('href')).toEqual('/foo/bar')
    expect(component.prop('as')).toBeNull()

    // with 'as' prop
    props.as = '/foo?bar'
    component = createLinkComponent()

    expect(component.prop('href')).toEqual('/foo/bar')
    expect(component.prop('as')).toEqual('/foo?bar')
  })

  it('renders with lang', () => {
    context.config.localeSubpaths = true
    context.config.defaultLanguage = 'en'
    context.i18n.languages = ['fr', 'en']

    // without 'as' prop -- no query parameters
    let component = createLinkComponent()

    expect(component.prop('href')).toEqual('/foo/bar?lng=fr')
    expect(component.prop('as')).toEqual('/fr/foo/bar')

    // without 'as' prop -- query parameters
    props.href = '/foo/bar?baz'
    component = createLinkComponent()

    expect(component.prop('href')).toEqual('/foo/bar?baz&lng=fr')
    expect(component.prop('as')).toEqual('/fr/foo/bar?baz')

    props.href = '/foo/bar'

    // with 'as' prop
    props.as = '/foo?bar'
    component = createLinkComponent()

    expect(component.prop('href')).toEqual('/foo/bar?lng=fr')
    expect(component.prop('as')).toEqual('/fr/foo?bar')
  })
})
