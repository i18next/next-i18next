# next-i18next App Router example (no locale in path)

This example shows how to use [next-i18next](https://github.com/i18next/next-i18next) v16 with the Next.js App Router **without** a locale prefix in the URL (cookie-based language detection).

URLs stay clean (`/about` instead of `/en/about`), and language switching is handled via `useChangeLanguage()`.

It demonstrates:
- Server Components using `getT()` from `next-i18next/server`
- Client Components using `useT()` from `next-i18next/client`
- Cookie-based language detection via `createProxy()` in `proxy.js` (no URL redirects)
- `useChangeLanguage()` hook for switching languages
- `I18nProvider` for client-side hydration

## Getting started

```bash
npm install
npm run dev
```

## Blog post

This example was originally based on this [blog post](https://www.locize.com/blog/next-app-dir-i18n?utm_source=next_i18next_app_router_no_locale_path_readme&utm_medium=github&utm_campaign=examples_app_router_no_locale_path_readme) and [discussion](https://github.com/i18next/next-app-dir-i18next-example/issues/12).

[![](https://www.locize.com/img/blog/next-app-dir-i18n/next-app-dir-i18n.jpg)](https://www.locize.com/blog/next-app-dir-i18n?utm_source=next_i18next_app_router_no_locale_path_readme&utm_medium=github&utm_campaign=examples_app_router_no_locale_path_readme)
