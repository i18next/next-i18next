import { getT } from 'next-i18next/server'

export async function generateMetadata() {
  const { t } = await getT('client-page')
  return {
    title: t('title')
  }
}

export default async function Layout({ children }) {
  return children
}