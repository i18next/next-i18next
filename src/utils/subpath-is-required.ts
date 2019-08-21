import { Config } from '../../types'

export default (config: Config, language: string) =>
  typeof config.localeSubpaths[language] === 'string' || Array.isArray(config.localeSubpaths[language])
