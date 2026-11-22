import type { AppProps } from 'next/app'
import { appWithTranslation } from 'next-i18next/pages'
// import nextI18NextConfig from '../next-i18next.config.js'

const MyApp = ({ Component, pageProps }: AppProps) => (
  <Component {...pageProps} />
)

// https://www.i18next.com/next/pages-router/setup#unserializable-configs
export default appWithTranslation(MyApp /*, nextI18NextConfig */)
