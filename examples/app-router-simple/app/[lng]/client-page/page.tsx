'use client'

import * as React from 'react'
import { useT } from 'next-i18next/client'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer/client'
import { Link } from '../components/Link/client'
import { useState } from 'react'

export default function Page() {
  const { t } = useT('client-page')
  const [counter, setCounter] = useState(0)
  return (
    <>
      <main>
        <Header heading={t('h1')} />
        <p>{t('counter', { count: counter })}</p>
        <div>
          <button onClick={() => setCounter(Math.max(0, counter - 1))}>-</button>
          <button onClick={() => setCounter(Math.min(10, counter + 1))}>+</button>
        </div>
        <Link href="/second-client-page">
          {t('to-second-client-page')}
        </Link>
        <Link href="/">
          <button type="button">
            {t('back-to-home')}
          </button>
        </Link>
      </main>
      <Footer path="/client-page" />
    </>
  )
}