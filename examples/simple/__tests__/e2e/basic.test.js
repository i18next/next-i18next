/* eslint-env jest */
/* eslint-disable no-undef */
const jestPuppeteerConfig = require('../../../../jest-puppeteer.config')

const testLanguage = 'en'
const testLanguageSecondary = 'de'

describe('example project', () => {
  beforeAll(async () => {
    await page.close()
    const context = await browser.createIncognitoBrowserContext()
    page = await context.newPage()

    await page.setExtraHTTPHeaders({
      'Accept-Language': testLanguage,
    })
    await page.goto(`http://localhost:${jestPuppeteerConfig.e2eTests.BASIC.port}/`)
  })

  it(`should display h1 in ${testLanguage} locale`, async () => {
    await expect(page).toMatch('A simple example')
  })

  it('should navigate to the second page and back', async () => {
    await expect(page).toClick('button', { text: 'To second page' })
    await expect(page).toMatch('A second page')

    await expect(page).toClick('button', { text: 'Back to home' })
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
      await expect(page).toClick('button', { text: 'Zur zweiten Seite' })
      await expect(page).toMatch('Eine zweite Seite')

      await expect(page).toClick('button', { text: 'Zurück zur Hauptseite' })
      await expect(page).toMatch('Ein einfaches Beispiel')
    })

    it(`should switch back to ${testLanguage} locale`, async () => {
      await expect(page).toClick('button', { text: 'Wechseln Locale' })

      await expect(page).toMatch('A simple example')
    })
  })
})
