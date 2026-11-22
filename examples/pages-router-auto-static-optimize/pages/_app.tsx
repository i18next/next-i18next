import type { AppProps } from 'next/app'
import { appWithTranslation } from 'next-i18next/pages'
import nextI18NextConfig from '../next-i18next.config'

const MyApp = ({ Component, pageProps }: AppProps) => (
  <Component {...pageProps} />
)

// https://www.i18next.com/next/pages-router/setup#unserializable-configs
export default (appWithTranslation as any)(MyApp, nextI18NextConfig)
