

import { subpathIsPresent } from '../../src/utils'

describe('subpathIsPresent utility function', () => {
  const subpath = 'german'

  it('returns false if url is not a string', () => {
    expect(subpathIsPresent(undefined, subpath)).toBe(false)
  })

  it('returns false if subpath is not a string', () => {
    expect(subpathIsPresent(undefined, subpath)).toBe(false)
  })

  it('returns false if url and subpath are both not strings', () => {
    expect(subpathIsPresent(undefined, undefined)).toBe(false)
  })

  it('returns false if basic url does not contain subpath', () => {
    expect(subpathIsPresent('/product', subpath)).toBe(false)
  })

  it('returns false if complex url does not contain subpath', () => {
    expect(subpathIsPresent('/product/ab3sf3c', subpath)).toBe(false)
  })

  it('returns false if basic url with query string does not contain subpath', () => {
    expect(subpathIsPresent('/product?hello=world', subpath)).toBe(false)
  })

  it('returns false if complex url with query string does not contain subpath', () => {
    expect(subpathIsPresent('/product/ab3sf3c?hello=world', subpath)).toBe(false)
  })

  it('returns false if query string contains subpath substring', () => {
    expect(subpathIsPresent('/product?german', subpath)).toBe(false)
  })

  it('returns true if basic url contains subpath', () => {
    expect(subpathIsPresent('/german/product', subpath)).toBe(true)
  })

  it('returns true if complex url contains subpath', () => {
    expect(subpathIsPresent('/german/product/ab3sf3c', subpath)).toBe(true)
  })

  it('returns true if basic url with query string contains subpath', () => {
    expect(subpathIsPresent('/german/product?hello=world', subpath)).toBe(true)
  })

  it('returns true if complex url with query string contains subpath', () => {
    expect(subpathIsPresent('/german/product/ab3sf3c?hello=world', subpath)).toBe(true)
  })

})
