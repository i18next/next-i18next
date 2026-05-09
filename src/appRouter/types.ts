import type { InitOptions, i18n as I18NextClient, TFunction, Resource, FlatNamespace } from 'i18next'

export type ResourceLoader = (language: string, namespace: string) => Promise<any>

export interface I18nConfig {
  /** Supported languages, e.g. ['en', 'de', 'it'] */
  supportedLngs: string[]
  /** Default/fallback language */
  fallbackLng: string
  /** Default namespace (defaults to 'common') */
  defaultNS?: string
  /** All known namespaces (defaults to [defaultNS]) */
  ns?: string[]

  // Resource loading
  /** Path to locale files relative to /public (defaults to '/locales') */
  localePath?: string
  /** Directory structure pattern (defaults to '{{lng}}/{{ns}}') */
  localeStructure?: string
  /** File extension (defaults to 'json') */
  localeExtension?: string
  /** Pre-loaded resources (if provided, skips dynamic loading) */
  resources?: Resource
  /** Custom resource loader function (overrides localePath) */
  resourceLoader?: ResourceLoader

  // Routing
  /** Whether to include locale in URL path (defaults to true) */
  localeInPath?: boolean
  /** When true (and localeInPath is true), the default language has no URL prefix.
   *  e.g. `/about` serves the default language, `/de/about` serves German.
   *  Requests to the explicit default prefix (`/en/about`) are redirected to `/about`. */
  hideDefaultLocale?: boolean

  // Middleware behavior
  /** Cookie name for storing selected language (defaults to 'i18next') */
  cookieName?: string
  /** Custom header name for passing language to server components (defaults to 'x-i18next-current-language') */
  headerName?: string
  /** Cookie max age in seconds (defaults to 365 * 24 * 60 * 60) */
  cookieMaxAge?: number
  /** URL path prefixes to ignore in middleware (defaults to ['/api', '/_next', '/static']) */
  ignoredPaths?: string[]
  /** Base path prefix for middleware to handle (e.g., '/app-router'). When set, the middleware only processes requests under this prefix and locale segments are placed after it. Useful for mixed App Router + Pages Router setups. */
  basePath?: string

  // Advanced
  /** Extra i18next plugins to use */
  use?: any[]
  /** Additional i18next init options (merged into init call) */
  i18nextOptions?: Omit<InitOptions, 'lng' | 'resources' | 'ns' | 'defaultNS' | 'supportedLngs' | 'fallbackLng'>

  // Legacy / Pages Router compatibility
  /** Legacy i18n config for Pages Router / next.config.js */
  i18n?: {
    defaultLocale: string
    locales: string[]
    domains?: {
      defaultLocale: string
      domain: string
      http?: true
      locales?: string[]
    }[]
    localeDetection?: false
  }
  /** @deprecated Use i18nextOptions instead */
  serializeConfig?: boolean
  /**
   * Dev-only: when true (and `NODE_ENV !== 'production'`), reload translation
   * resources from the backend before each render so edits to locale files
   * appear without restarting `next dev`. No effect in production builds.
   */
  reloadOnPrerender?: boolean
  /** Support non-explicit language codes like 'en' matching 'en-US' */
  nonExplicitSupportedLngs?: boolean
}

export interface NormalizedConfig {
  supportedLngs: string[]
  fallbackLng: string
  defaultNS: string
  ns: string[]
  localeInPath: boolean
  hideDefaultLocale: boolean
  localePath: string
  localeStructure: string
  localeExtension: string
  cookieName: string
  headerName: string
  cookieMaxAge: number
  ignoredPaths: string[]
  basePath?: string
  resources?: Resource
  resourceLoader?: ResourceLoader
  use: any[]
  i18nextOptions: Record<string, any>
  nonExplicitSupportedLngs: boolean
  // Legacy fields preserved for pages path
  i18n?: I18nConfig['i18n']
  serializeConfig?: boolean
  reloadOnPrerender?: boolean
}

export type GetTResult<Ns extends FlatNamespace = FlatNamespace, KPrefix = undefined> = {
  t: TFunction<Ns, KPrefix>
  i18n: I18NextClient
  /** The resolved language for the current request */
  lng: string
}
