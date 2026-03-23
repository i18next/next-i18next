'use client'

import * as React from 'react'
import { useT } from 'next-i18next/client'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer/client'
import { Link } from '../components/Link/client'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()
  const { t, i18n } = useT('second-client-page')
  return (
    <>
      <main>
        <Header heading={t('h1')} />
        <Link href="/">
          <button type="button">
            {t('back-to-home')}
          </button>
        </Link>
        <button type="button" onClick={() => router.push(`/${i18n.resolvedLanguage}/client-page`)}>
          {t('to-client-page')}
        </button>
      </main>
      <Footer path="/second-client-page" />
    </>
  )
}