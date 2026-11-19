// Root export: config + types (Edge-safe — no react-i18next dependency)
export { defineConfig, normalizeConfig } from './config'
export { getLocalizedPath, getInternalPath } from './pathnames'
export type {
  I18nConfig,
  NormalizedConfig,
  GetTResult,
  ResourceLoader,
  CookieOptions,
  Pathnames,
} from './types'
