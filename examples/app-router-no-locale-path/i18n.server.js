import { createServerI18next } from 'next-i18next/server'
import i18nConfig from './i18n.config'

export const { getT, getResources } = createServerI18next(i18nConfig)
