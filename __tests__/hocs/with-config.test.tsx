import React from 'react'
import { mount } from 'enzyme'

import { withInternals } from '../../src/hocs'
import { localeSubpathVariations } from '../config/test-helpers'

describe('withInternals HoC', () => {
  let config
  let props
  let WrappedComponent

  beforeEach(() => {
    config = { localeSubpaths: localeSubpathVariations.FOREIGN }
    props = {}
    WrappedComponent = () => <div />
  })

  it('adds nextI18NextInternals prop to component', () => {
    const Component = withInternals(WrappedComponent, config)

    expect(mount(<Component />).find('WrappedComponent').prop('nextI18NextInternals'))
      .toEqual({ localeSubpaths: localeSubpathVariations.FOREIGN })
  })

  it('passes other props into wrapped component', () => {
    props.prop = 'value'

    const Component = withInternals(WrappedComponent, config)

    const wrappedComponent = mount(<Component {...props} />).find('WrappedComponent')
    expect(wrappedComponent.prop('nextI18NextInternals')).toEqual({ localeSubpaths: localeSubpathVariations.FOREIGN })
    expect(wrappedComponent.prop('prop')).toEqual('value')
  })

  describe('displayName', () => {
    it('renders with Component displayName, if displayName available', () => {
      WrappedComponent.displayName = 'withAnotherHoC(WrappedComponent)'
      const Component = withInternals(WrappedComponent, config)

      expect(Component.displayName)
        .toEqual('withnextI18NextInternals(withAnotherHoC(WrappedComponent))')
    })

    it('renders Component name, if displayName not available', () => {
      const Component = withInternals(WrappedComponent, config)

      expect(Component.displayName).toEqual('withnextI18NextInternals(WrappedComponent)')
    })

    it('renders "Component" for Component name, if no names available', () => {
      const Component = withInternals(<div />, config)

      expect(Component.displayName).toEqual('withnextI18NextInternals(Component)')
    })
  })
})
