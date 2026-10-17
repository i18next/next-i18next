'use client'

import React from 'react'
import ICU from 'i18next-icu'
import { I18nProvider as BaseI18nProvider, type I18nProviderProps } from './client'

/**
 * `I18nProvider` from `next-i18next/client` with i18next-icu registered, for translations
 * in ICU MessageFormat. Render it from the root layout like the plain provider.
 *
 * A Server Component can not pass a plugin class to a Client Component as a prop, so the
 * plugin is imported here, in a Client module, instead of going through `use`. Only apps
 * that import `next-i18next/icu` resolve i18next-icu. Register it on the server as well:
 * `use: [ICU]` in the config passed to `initServerI18next` / `createServerI18next`.
 *
 * @example
 * ```tsx
 * // app/[lng]/layout.tsx (Server Component)
 * import { I18nProvider } from 'next-i18next/icu'
 *
 * <I18nProvider language={lng} resources={resources}>{children}</I18nProvider>
 * ```
 */
export function I18nProvider({ use = [], ...props }: I18nProviderProps) {
  return <BaseI18nProvider {...props} use={[ICU, ...use]} />
}
