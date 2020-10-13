import { isCIMode } from '../../src/utils/is-cimode'

describe('isCIMode utility function', () => {
  it('validates cimode language', () => {
    expect(isCIMode('cimode')).toBe(true)
  })
})