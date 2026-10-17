# next-i18next App Router example with ICU MessageFormat

This example shows how to write translations in ICU MessageFormat with [next-i18next](https://github.com/i18next/next-i18next) and the Next.js App Router, using [i18next-icu](https://github.com/i18next/i18next-icu).

It demonstrates:
- `use: [ICU]` in `i18n.config.ts`, so `getT()` formats ICU messages in Server Components
- `I18nProvider` from `next-i18next/icu` in the root layout, so `useT()` formats them in Client Components, without a `'use client'` wrapper of your own
- a plural with an exact `=0` case and a `select`, on the server and on the client
- rich text with `IcuTransWithoutContext` from `react-i18next/IcuTransWithoutContext` in a Server Component, and `IcuTrans` in a Client Component
- `parseInterpolation: false` in `@types/i18next.d.ts`, so typed keys work with ICU messages

For MF2, install `i18next-mf2` instead, put `MF2` into `use` and import `I18nProvider` from `next-i18next/mf2`.

See [ICU and MF2 with the App Router](https://github.com/i18next/next-i18next#icu-and-mf2-with-the-app-router) and [Using ICU or MF2](https://www.i18next.com/how-to/using-icu-or-mf2) for details.

## Getting started

```bash
npm install
npm run dev
```
