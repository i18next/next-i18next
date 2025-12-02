/* eslint-disable @typescript-eslint/no-unused-vars */

import type { WithTranslation, UseTranslation } from './types'

type X = WithTranslation<'common'>

const _assert: X = {
  i18n: {} as any,
  // t signature is complex; cast to any for this compile-only check
  t: ((..._args: any[]) => '') as any,
  tReady: true,
}

type R = ReturnType<UseTranslation<'common'>>

const _assertTwo: R = [
  // t
  ((..._args: any[]) => '') as any,
  // i18n
  {} as any,
  // ready
  true,
] as any


// Runtime noop test so Jest treats this file as a test suite.
test('types compile-only', () => {
  expect(true).toBe(true)
})