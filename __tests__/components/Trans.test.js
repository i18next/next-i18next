/* eslint-env jest */

import React from 'react'
import { mount } from 'enzyme'
import { Trans as ReactTrans } from 'react-i18next'

import Trans from '../../src/components/Trans'

jest.mock('react-i18next', () => ({
  Trans: () => 'mock-trans',
  withNamespaces: () => Component => Component,
}))

describe('Trans component', () => {
  let props

  beforeEach(() => {
    props = {
      i18n: {
        languages: ['de', 'en'],
      },
      i18nKey: 'title',
    }
  })

  it('renders react-i18next Trans component with props and i18n prop', () => {
    const component = mount(<Trans {...props} />)

    expect(component.find(ReactTrans).prop('i18n')).toEqual({ languages: ['de', 'en'] })
    expect(component.find(ReactTrans).prop('i18nKey')).toEqual('title')
  })
})
