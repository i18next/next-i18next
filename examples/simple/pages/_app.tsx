import type { AppProps } from 'next/app'
import { appWithTranslation } from 'next-i18next'
// import nextI18NextConfig from '../next-i18next.config.js'

const MyApp = ({ Component, pageProps }: AppProps) => (
  <Component {...pageProps} />
)

// https://github.com/i18next/next-i18next#unserializable-configs
export default appWithTranslation(MyApp /*, nextI18NextConfig */)
