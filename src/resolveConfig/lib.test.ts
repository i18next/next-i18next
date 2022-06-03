import path from 'path'
import { importConfig, isConfigExisting } from './lib'

const configFolder = path.resolve(__dirname)

describe('resolveConfig', () => {
  it('detects an ineligible config', () => expect(
    isConfigExisting(configFolder, 'non-config')
  ).toBe(true))

  it('rejects an ineligible config', async () => {
    let caughtError: Error | undefined = undefined

    try {
      await importConfig(configFolder, 'non-config')
    } catch (error) {
      caughtError = error as Error
    }

    return expect(caughtError).toBeInstanceOf(Error)
  })

  it('resolves json config', async () => {
    const userConfig = await importConfig(configFolder, 'json')

    return expect(userConfig).toBeTruthy()
  })

  it('throws on invalid json config', async () => {
    let caughtError: Error | undefined = undefined

    try {
      await importConfig(configFolder, 'invalid-json')
    } catch (error) {
      caughtError = error as Error
    }

    return expect(caughtError).toBeInstanceOf(Error)
  })

  it('resolves cjs file', async () => {
    const userConfig = await importConfig(configFolder, 'cjs')

    return expect(userConfig).toBeTruthy()
  })

  it('resolves mjs file', async () => {
    const userConfig = await importConfig(configFolder, 'mjs')

    return expect(userConfig).toBeTruthy()
  })

  it('resolves js file', async () => {
    const userConfig = await importConfig(configFolder, 'js')

    return expect(userConfig).toBeTruthy()
  }
  )
})
