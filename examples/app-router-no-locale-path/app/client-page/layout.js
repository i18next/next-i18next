import { getT } from '@/i18n.server'

export async function generateMetadata() {
  const { t } = await getT('client-page')
  return {
    title: t('title')
  }
}

export default async function Layout({ children }) {
  return children
}