import { Config } from '../../types'

export const subpathIsRequired = (config: Config, language: string) =>
  typeof config.localeSubpaths[language] === 'string'
