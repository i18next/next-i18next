/* eslint-env jest */

import React from 'react'
import { mount } from 'enzyme'

import { withConfig } from 'hocs'

describe('withConfig HoC', () => {
  let config
  let props
  let WrappedComponent

  beforeEach(() => {
    config = { localeSubpaths: true }
    props = {}
    WrappedComponent = () => <div />
  })

  it('adds nextI18NextConfig prop to component', () => {
    const Component = withConfig(WrappedComponent, config)

    expect(mount(<Component />).find('WrappedComponent').prop('nextI18NextConfig'))
      .toEqual({ localeSubpaths: true })
  })

  it('passes other props into wrapped component', () => {
    props.prop = 'value'

    const Component = withConfig(WrappedComponent, config)

    const wrappedComponent = mount(<Component {...props} />).find('WrappedComponent')
    expect(wrappedComponent.prop('nextI18NextConfig')).toEqual({ localeSubpaths: true })
    expect(wrappedComponent.prop('prop')).toEqual('value')
  })

  describe('getInitialProps', () => {
    const ctx = {}

    it('returns empty object if getInitialProps of wrapped component does not exist', async () => {
      const Component = withConfig(WrappedComponent, config)

      expect(await Component.getInitialProps(ctx)).toEqual({})
    })

    it('calls getInitialProps of wrapped component, if it exists', async () => {
      WrappedComponent.getInitialProps = jest.fn(() => Promise.resolve({ prop: 'value' }))
      const Component = withConfig(WrappedComponent, config)

      expect(await Component.getInitialProps(ctx)).toEqual({ prop: 'value' })
      expect(WrappedComponent.getInitialProps).toBeCalledWith(ctx)
    })
  })

  describe('displayName', () => {
    it('renders with Component displayName, if displayName available', () => {
      WrappedComponent.displayName = 'withAnotherHoC(WrappedComponent)'
      const Component = withConfig(WrappedComponent, config)

      expect(Component.displayName)
        .toEqual('withNextI18NextConfig(withAnotherHoC(WrappedComponent))')
    })

    it('renders Component name, if displayName not available', () => {
      const Component = withConfig(WrappedComponent, config)

      expect(Component.displayName).toEqual('withNextI18NextConfig(WrappedComponent)')
    })

    it('renders "Component" for Component name, if no names available', () => {
      const Component = withConfig(<div />, config)

      expect(Component.displayName).toEqual('withNextI18NextConfig(Component)')
    })
  })
})
