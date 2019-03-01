/* eslint-env jest */

import React from 'react'
import { mount } from 'enzyme'

import { withConfig } from '../../src/hocs'
import { localeSubpathOptions } from '../../src/config/default-config'

describe('withConfig HoC', () => {
  let config
  let props
  let WrappedComponent

  beforeEach(() => {
    config = { localeSubpaths: localeSubpathOptions.FOREIGN }
    props = {}
    WrappedComponent = () => <div />
  })

  it('adds nextI18NextConfig prop to component', () => {
    const Component = withConfig(WrappedComponent, config)

    expect(mount(<Component />).find('WrappedComponent').prop('nextI18NextConfig'))
      .toEqual({ localeSubpaths: localeSubpathOptions.FOREIGN })
  })

  it('passes other props into wrapped component', () => {
    props.prop = 'value'

    const Component = withConfig(WrappedComponent, config)

    const wrappedComponent = mount(<Component {...props} />).find('WrappedComponent')
    expect(wrappedComponent.prop('nextI18NextConfig')).toEqual({ localeSubpaths: localeSubpathOptions.FOREIGN })
    expect(wrappedComponent.prop('prop')).toEqual('value')
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
