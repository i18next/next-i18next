import { appWithTranslation } from 'next-i18next/pages'

const MyApp = ({ Component, pageProps }) => (
  <Component {...pageProps} />
)

export default appWithTranslation(MyApp)
