import { createProxy } from 'next-i18next/proxy'
import i18nConfig from './i18n.config'

export const proxy = createProxy(i18nConfig)

export const config = {
  matcher: ['/app-router/:path*'],
}
