'use client'

import { useState } from 'react'
import { IcuTrans } from 'react-i18next'
import { useT } from 'next-i18next/client'

// Client Component: useT() formats ICU messages with the client instance from next-i18next/icu
export function Cart() {
  const { t } = useT()
  const [count, setCount] = useState(0)

  return (
    <section>
      <p id='client-plural'>{t('cart', { count })}</p>
      <button onClick={() => setCount(c => c + 1)}>{t('add')}</button>{' '}
      <button onClick={() => setCount(c => Math.max(0, c - 1))} disabled={count === 0}>{t('remove')}</button>
      <p id='client-select'>{t('order', { status: count > 0 ? 'pending' : 'unknown' })}</p>
      <p id='client-rich'>
        <IcuTrans
          i18nKey='rendered'
          defaultTranslation='Rendered by a <0>{where}</0> Component.'
          content={[{ type: 'em' }]}
          values={{ where: 'Client' }}
        />
      </p>
    </section>
  )
}
