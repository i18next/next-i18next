/* eslint-env jest */

import React from 'react'
import { mount } from 'enzyme'

import NextStaticProvider from '../../src/components/NextStaticProvider'

jest.mock('react-i18next', () => ({
  withNamespaces: () => Component => Component,
}))

describe('NextStaticProvider component', () => {
  let props

  beforeEach(() => {
    props = {}
  })

  it('does not render children if tReady === false', () => {
    props.tReady = false

    const component = mount(
      <NextStaticProvider {...props}>
        <div>Child component</div>
      </NextStaticProvider>,
    )

    expect(component.find('div').length).toEqual(0)
  })

  it('renders children if tReady === true', () => {
    props.tReady = true

    const component = mount(
      <NextStaticProvider {...props}>
        <div>Child component</div>
      </NextStaticProvider>,
    )

    expect(component.find('div').length).toEqual(1)
    expect(component.find('div').text()).toEqual('Child component')
  })
})
