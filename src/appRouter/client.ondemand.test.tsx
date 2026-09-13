/**
 * @jest-environment jsdom
 */

// Real i18next + react-i18next (no mocks): reproduces the `preload: []` flow where
// the server ships only the current language and sends the next one after
// router.refresh(). See https://github.com/i18next/next-i18next/issues/2348

import React from 'react'
import { render, screen, act } from '@testing-library/react'

const mockRefresh = jest.fn()
jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({})),
  useRouter: jest.fn(() => ({ refresh: mockRefresh, push: jest.fn(), replace: jest.fn() })),
}))

import { I18nProvider, useT, useChangeLanguage } from './client'

// Fresh objects per test: i18next keeps the `resources` object by reference and
// mutates it when bundles are added.
const enOnly = () => ({ en: { translation: { hi: 'Hello' } } })
const withIt = () => ({ ...enOnly(), it: { translation: { hi: 'Ciao' } } })

let i18n: any

function Probe () {
  const { t, i18n: inst } = useT('translation')
  i18n = inst
  return <span data-testid='out'>{`${t('hi')}|${inst.language}|${inst.resolvedLanguage}`}</span>
}

const provider = (language: string, resources: any) => (
  <I18nProvider language={language} resources={resources} defaultNS='translation' fallbackLng='en'>
    <Probe />
  </I18nProvider>
)

it('picks up a language that arrives only after the server re-render', async () => {
  const { rerender } = render(provider('en', enOnly()))
  expect(screen.getByTestId('out').textContent).toBe('Hello|en|en')

  // router.refresh() → the layout re-renders on the server with the new language
  await act(async () => { rerender(provider('it', withIt())) })

  expect(screen.getByTestId('out').textContent).toBe('Ciao|it|it')
})

it('recovers when the client switched language before its resources arrived', async () => {
  const { rerender } = render(provider('en', enOnly()))

  // useChangeLanguage switches the instance first — its store has no 'it' yet
  await act(async () => { await i18n.changeLanguage('it') })
  expect(screen.getByTestId('out').textContent).toBe('Hello|it|en')

  // …then router.refresh() brings the resources the server just loaded
  await act(async () => { rerender(provider('it', withIt())) })

  // resolvedLanguage needs react-i18next >= 17.0.14, which refreshes the i18n object it
  // hands out when the language resolves differently without `language` itself changing
  expect(screen.getByTestId('out').textContent).toBe('Ciao|it|it')
})

it('waits for the resources instead of resolving the new language to the fallback', async () => {
  let change: (lng: string) => Promise<void>
  function Switcher () {
    const { t, i18n } = useT('translation')
    change = useChangeLanguage()
    return <span data-testid='out'>{`${t('hi')}|${i18n.resolvedLanguage}`}</span>
  }
  const { rerender } = render(
    <I18nProvider language='en' resources={enOnly()} defaultNS='translation' fallbackLng='en'>
      <Switcher />
    </I18nProvider>,
  )

  await act(async () => { await change!('it') })
  expect(document.cookie).toContain('i18next=it')
  expect(mockRefresh).toHaveBeenCalled()

  // router.refresh() → server re-render with Italian
  await act(async () => {
    rerender(
      <I18nProvider language='it' resources={withIt()} defaultNS='translation' fallbackLng='en'>
        <Switcher />
      </I18nProvider>,
    )
  })

  expect(screen.getByTestId('out').textContent).toBe('Ciao|it')
})
