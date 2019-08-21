import { Config } from '../../types'

export default (config: Config, language: string) => {

  if (typeof language !== 'string') {
    return null
  }

  let subpath = config.localeSubpaths[language]
  if (Array.isArray(subpath)) {
    [subpath] = subpath
  }

  if (typeof subpath !== 'string') {
    return null
  }

  return subpath

}
