/* eslint-env jest */

import React from 'react'
import { mount } from 'enzyme'
import { Trans as ReactTrans } from 'react-i18next'

import transFunction from '../../src/components/Trans'

jest.mock('react-i18next', () => ({
  Trans: () => 'mock-trans',
}))

describe('Trans component', () => {
  let context
  let props

  beforeEach(() => {
    context = {}

    context.i18n = {
      languages: ['de', 'en'],
    }

    props = {
      i18nKey: 'title',
    }
  })

  const createTransComponent = () => {
    const Trans = transFunction.apply(context)

    return mount(<Trans {...props} />)
  }

  it('renders react-i18next Trans component with props and i18n prop', () => {
    const component = createTransComponent()

    expect(component.find(ReactTrans).prop('i18n')).toEqual(context.i18n)
    expect(component.find(ReactTrans).prop('i18nKey')).toEqual('title')
  })
})
