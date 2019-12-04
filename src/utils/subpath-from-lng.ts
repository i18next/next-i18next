import { Config } from '../../types'

export const subpathFromLng = (config: Config, language: string) => {

  if (typeof language !== 'string') {
    return null
  }

  const subpath = config.localeSubpaths[language]

  if (typeof subpath !== 'string') {
    return null
  }

  return subpath

}
