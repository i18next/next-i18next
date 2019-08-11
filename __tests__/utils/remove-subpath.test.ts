import { removeSubpath } from '../../src/utils'

describe('subpathFromLng utility function', () => {
  it('returns unchanged string if subpath is not present', () => {
    expect(removeSubpath('/product', '/de')).toBe('/product')
  })

  it('removes subpath if present', () => {
    expect(removeSubpath('/de/product', '/de')).toBe('/product')
  })

  it('is agnostic of trailing slash on subpath if present', () => {
    expect(removeSubpath('/de/product/', '/de')).toBe('/product/')
  })

  it('retains query string on subpath if present', () => {
    expect(removeSubpath('/de/product?hello=world', '/de')).toBe('/product?hello=world')
  })

  it('removes only the first occurrence if present', () => {
    expect(removeSubpath('/de/de/product', '/de')).toBe('/de/product')
  })
})
