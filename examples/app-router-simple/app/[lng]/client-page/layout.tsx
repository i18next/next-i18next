import { getT, generateI18nStaticParams } from 'next-i18next/server'

export async function generateStaticParams() {
  return generateI18nStaticParams()
}

export async function generateMetadata() {
  const { t } = await getT('client-page')
  return {
    title: t('title')
  }
}

export default function Layout({ children }: {
  children: React.ReactNode;
  params: Promise<{ lng: string; }>;
}) {
  return children
}
