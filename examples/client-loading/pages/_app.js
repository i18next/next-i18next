import { appWithTranslation } from 'next-i18next'
import nextI18nConfig from '../next-i18next.config'

const MyApp = ({ Component, pageProps }) => <Component {...pageProps} />

export default appWithTranslation(MyApp, nextI18nConfig)
