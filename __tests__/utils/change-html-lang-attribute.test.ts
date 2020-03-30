import { changeHtmlLangAttribute } from '../../src/utils/change-html-lang-attribute'

describe('changeHtmlLangAttribute', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div>Hello World</div>'
  })

  it('should change <html> lang attribute based on its first parameter', () => {
    changeHtmlLangAttribute('de')
    expect(document.querySelector('html').getAttribute('lang')).toBe('de')

    changeHtmlLangAttribute('fr')
    expect(document.querySelector('html').getAttribute('lang')).toBe('fr')
  })
})
