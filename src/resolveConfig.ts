import fs from 'fs'
import path from 'path'

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
