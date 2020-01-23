/* eslint-env jest */
/* eslint-disable no-undef */
const jestPuppeteerConfig = require('../../../../jest-puppeteer.config')

const testLanguage = 'en'

describe('example project making use of useRouter', () => {
  beforeAll(async () => {
    await page.close()
    const context = await browser.createIncognitoBrowserContext()
    page = await context.newPage()

    await page.setExtraHTTPHeaders({
      'Accept-Language': testLanguage,
    })
    await page.goto(`http://localhost:${jestPuppeteerConfig.e2eTests.BASIC.port}/use-router`)
  })

  it('should display the correct headline', async () => {
    const content = await page.$eval('h1', (e) => e.textContent)
    expect(content).toBe('Another page, to demonstrate useRouter')
  })

  it('should navigate to the home page', async () => {
    await expect(page).toClick('button', { text: 'Back to home' })
    await expect(page).toMatch('A simple example')
  })
})

describe('example project making use of withRouter', () => {
  beforeAll(async () => {
    await page.close()
    const context = await browser.createIncognitoBrowserContext()
    page = await context.newPage()

    await page.setExtraHTTPHeaders({
      'Accept-Language': testLanguage,
    })
    await page.goto(`http://localhost:${jestPuppeteerConfig.e2eTests.BASIC.port}/with-router`)
  })

  it('should display the correct headline', async () => {
    const content = await page.$eval('h1', (e) => e.textContent)
    expect(content).toBe('Another page, to demonstrate withRouter')
  })

  it('should navigate to the home page', async () => {
    await expect(page).toClick('button', { text: 'Back to home' })
    await expect(page).toMatch('A simple example')
  })
})
