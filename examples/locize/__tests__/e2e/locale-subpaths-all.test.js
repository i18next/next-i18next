/* eslint-env jest */
/* eslint-disable no-undef */
const jestPuppeteerConfig = require('../../../../jest-puppeteer.config')

const testLanguage = 'en'
const testLanguageSecondary = 'de'

describe('example project with localeSubpaths set to all', () => {
  beforeAll(async () => {
    await page.close()
    const context = await browser.createIncognitoBrowserContext()
    page = await context.newPage()

    await page.setExtraHTTPHeaders({
      'Accept-Language': testLanguage,
    })
    await page.goto(`http://localhost:${jestPuppeteerConfig.e2eTests.LOCALE_SUBPATHS_ALL.port}/`)
    await page.waitForSelector('html')
    await expect(page.url()).toBe(`http://localhost:${jestPuppeteerConfig.e2eTests.LOCALE_SUBPATHS_ALL.port}/en`)
  })

  describe(`changing to ${testLanguageSecondary} locale`, () => {
    beforeAll(async () => {
      await expect(page).toClick('button', { text: 'Change locale' })
      await page.waitForNavigation()
      await expect(page.url()).toBe(`http://localhost:${jestPuppeteerConfig.e2eTests.LOCALE_SUBPATHS_ALL.port}/${testLanguageSecondary}`)
    })

    it(`should display h1 in ${testLanguageSecondary} locale`, async () => {
      await expect(page).toMatch('Ein einfaches Beispiel')
    })
  })
})
