# next-i18next App Router example (locale-in-path)

This example shows how to use [next-i18next](https://github.com/i18next/next-i18next) v16 with the Next.js App Router and locale-in-path routing (`/en/about`, `/de/about`).

It demonstrates:
- Server Components using `getT()` from `next-i18next/server`
- Client Components using `useT()` from `next-i18next/client`
- Language detection and routing via `createProxy()` in `proxy.ts`
- `I18nProvider` for client-side hydration
- `generateStaticParams` for static generation of all locales
- `Trans` component usage in both server and client components

## Getting started

```bash
npm install
npm run dev
```

## Blog post

There's also a [blog post](https://www.locize.com/blog/i18n-next-app-router?utm_source=next_i18next_app_router_simple_readme&utm_medium=github&utm_campaign=examples_app_router_simple_readme) describing the i18n approach in more detail.

[![](https://www.locize.com/img/blog/i18n-next-app-router/i18n-next-app-router.jpg)](https://www.locize.com/blog/i18n-next-app-router?utm_source=next_i18next_app_router_simple_readme&utm_medium=github&utm_campaign=examples_app_router_simple_readme)
