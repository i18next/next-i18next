/* eslint-env jest */
const testLanguage = 'en'
const testLanguageSecondary = 'de'

describe('example project', () => {
  beforeAll(async () => {
    await page.setExtraHTTPHeaders({
      'Accept-Language': testLanguage,
    })
    await page.goto('http://localhost:3000/')
  })

  it(`should display h1 in ${testLanguage} locale`, async () => {
    await expect(page).toMatch('A simple example')
  })

  it('should navigate to the second page and back', async () => {
    await expect(page).toClick('a', { text: 'To second page' })
    await expect(page).toMatch('A second page')

    await expect(page).toClick('a', { text: 'Back to home' })
    await expect(page).toMatch('A simple example')
  })

  it(`should display products in ${testLanguage} locale`, async () => {
    await expect(page).toMatch('Product #1')
    await expect(page).toMatch('Product #2')
    await expect(page).toMatch('Product #3')
  })

  it('should navigate to a product page and back', async () => {
    await expect(page).toClick('a', { text: 'Product #1' })
    await expect(page).toMatch('Product #1')

    await expect(page).toClick('a', { text: 'Back to home' })
    await expect(page).toMatch('A simple example')
  })

  describe(`changing to ${testLanguageSecondary} locale`, () => {
    beforeAll(async () => {
      await expect(page).toClick('button', { text: 'Change locale' })
    })

    it(`should display h1 in ${testLanguageSecondary} locale`, async () => {
      await expect(page).toMatch('Ein einfaches Beispiel')
    })

    it('should navigate to the second page and back', async () => {
      await expect(page).toClick('a', { text: 'Zur zweiten Seite' })
      await expect(page).toMatch('Eine zweite Seite')

      await expect(page).toClick('a', { text: 'Zurück zur Hauptseite' })
      await expect(page).toMatch('Ein einfaches Beispiel')
    })

    it(`should display products in ${testLanguageSecondary} locale`, async () => {
      await expect(page).toMatch('Produkt #1')
      await expect(page).toMatch('Produkt #2')
      await expect(page).toMatch('Produkt #3')
    })

    it('should navigate to a product page and back', async () => {
      await expect(page).toClick('a', { text: 'Produkt #1' })
      await expect(page).toMatch('Produkt #1')

      await expect(page).toClick('a', { text: 'Zurück zur Hauptseite' })
      await expect(page).toMatch('Ein einfaches Beispiel')
    })

    it(`should switch back to ${testLanguage} locale`, async () => {
      await expect(page).toClick('button', { text: 'Wechseln Locale' })

      await expect(page).toMatch('A simple example')
    })
  })
})
