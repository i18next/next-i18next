/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { I18nProvider as IcuI18nProvider } from './icu'
import { I18nProvider as Mf2I18nProvider } from './mf2'
import { useT } from './client'

jest.mock('next/navigation', () => ({
  useParams: () => ({}),
  useRouter: () => ({ refresh: jest.fn() }),
}))

function Photos() {
  const { t } = useT()
  return <p>{t('photos', { count: 3 })} / {t('friend', { context: 'female' })}</p>
}

const upper = { type: 'postProcessor', name: 'upper', process: (value: string) => value.toUpperCase() }

describe('format providers', () => {
  it('next-i18next/icu formats ICU plurals and selects, and keeps plugins from use', () => {
    render(
      <IcuI18nProvider
        language='en'
        resources={{
          en: {
            common: {
              photos: 'You have {count, plural, one {# photo} other {# photos}}',
              friend: '{context, select, female {a girlfriend} other {a friend}}',
            },
          },
        }}
        use={[upper]}
        i18nextOptions={{ postProcess: ['upper'] }}
      >
        <Photos />
      </IcuI18nProvider>
    )
    expect(screen.getByText('YOU HAVE 3 PHOTOS / A GIRLFRIEND')).toBeTruthy()
  })

  it('next-i18next/mf2 formats MF2 plurals and selects', () => {
    render(
      <Mf2I18nProvider
        language='en'
        resources={{
          en: {
            common: {
              photos: '.input {$count :number} .match $count one {{You have {$count} photo}} * {{You have {$count} photos}}',
              friend: '.input {$context :string} .match $context female {{a girlfriend}} * {{a friend}}',
            },
          },
        }}
        i18nextOptions={{ i18nFormat: { bidiIsolation: 'none' } }}
      >
        <Photos />
      </Mf2I18nProvider>
    )
    expect(screen.getByText('You have 3 photos / a girlfriend')).toBeTruthy()
  })
})
