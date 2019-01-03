/* eslint-env jest */
const testLanguage = 'en'

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

  it('should navigate to the second page', async () => {
    await expect(page).toClick('a', { text: 'To second page' })
    await expect(page).toMatch('A second page')
  })

})
