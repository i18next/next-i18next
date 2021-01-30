import React from 'react';
import { appWithTranslation } from 'next-i18next'
import { AppProps } from 'next/app'

const MyApp = ({ Component, pageProps }: AppProps) => <Component {...pageProps} />

export default appWithTranslation(MyApp)
