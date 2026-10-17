'use client'

import React from 'react'
import MF2 from 'i18next-mf2'
import { I18nProvider as BaseI18nProvider, type I18nProviderProps } from './client'

/**
 * `I18nProvider` from `next-i18next/client` with i18next-mf2 registered, for translations
 * in Unicode MessageFormat 2. Same as `next-i18next/icu`, for MF2: register `use: [MF2]`
 * in the server config as well.
 */
export function I18nProvider({ use = [], ...props }: I18nProviderProps) {
  return <BaseI18nProvider {...props} use={[MF2, ...use]} />
}
