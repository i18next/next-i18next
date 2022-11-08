import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import nextI18NextConfig from '../next-i18next.config.js'

export const getI18nPaths = () =>
  nextI18NextConfig.i18n.locales.map((lng) => ({
    params: {
      locale: lng,
    },
  }))

export const getStaticPaths = () => ({
  fallback: false,
  paths: getI18nPaths(),
})

export const getI18nProps = async (ctx, ns = ['common']) => {
  const locale = ctx?.params?.locale
  let props = {
    ...(await serverSideTranslations(locale, ns, nextI18NextConfig)),
  }
  return props
}

export const makeStaticProps = (ns = []) => async (ctx) => ({
  props: await getI18nProps(ctx, ns),
})
