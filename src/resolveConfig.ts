import fs from 'fs'
import path from 'path'

import type { UserConfig, UserConfigModule } from './types'

export const isConfigExisting = (
  configFolder: string,
  configFilename: string
): boolean => {
  const folderItems = fs.readdirSync(configFolder, { withFileTypes: true })

  const configFile = folderItems.find((dirent) => {
    const filePath = path.join(configFolder, dirent.name)
    const parsedPath = path.parse(filePath)

    return dirent.isFile()
      && parsedPath.name === configFilename
  })

  if (!configFile) {
    return false
  }

  return true
}

export const importConfig = async (
  configFolder: string,
  configFilename: string
): Promise<UserConfig> => {
  const folderItems = fs.readdirSync(configFolder, { withFileTypes: true })

  const configFile = folderItems.find((dirent) => {
    const filePath = path.join(configFolder, dirent.name)
    const parsedPath = path.parse(filePath)

    return dirent.isFile()
      && parsedPath.name === configFilename
  })

  if (!configFile) {
    throw new Error(
      `The config file by the name "${configFilename}" doesn't exist at folder "${configFolder}" but should.`
    )
  }

  const configPath = path.join(configFolder, configFile.name)
  const parsedPath = path.parse(configPath)

  switch (parsedPath.ext) {

  case '.json': {
    const jsonContent = fs.readFileSync(configPath, { encoding: 'utf-8' })
    const userConfig: UserConfig = JSON.parse(jsonContent)
    return userConfig
  }

  case '.cjs':
  case '.mjs':
  case '.js': {
    const userConfigModule: UserConfigModule = await import(configPath)

    if (typeof userConfigModule === 'function') {
      const resolvedConfig = await userConfigModule()
      return resolvedConfig
    }

    return userConfigModule
  }

  default: {
    throw new Error(
      `File extension ${parsedPath.ext} is not supported for the config file.`
    )
  }
  }
}
