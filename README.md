# next-i18next

[![npm version](https://img.shields.io/npm/v/next-i18next.svg?style=flat-square)](https://www.npmjs.com/package/next-i18next)
![npm](https://img.shields.io/npm/dw/next-i18next)

**The easiest way to translate your Next.js apps.**

Supports the **App Router** (Server Components, Client Components, middleware), the **Pages Router**, and **mixed** setups where both routers coexist.

If you already know i18next: next-i18next v16 is a thin layer on top of [i18next](https://www.i18next.com) and [react-i18next](https://react.i18next.com) that handles the Next.js-specific wiring — middleware, server/client split, resource hydration — so you don't have to.

## What's new in v16

- **App Router support**: `getT()` for Server Components, `useT()` for Client Components, `createProxy()` for language detection and routing
- **Locale-in-path** (`/en/about`) and **no-locale-path** (cookie-based) modes
- **Mixed Router**: Use both App Router and Pages Router in the same app with `basePath` scoping
- **Custom Backends**: `i18next-http-backend`, `i18next-locize-backend`, `i18next-chained-backend`, etc.
- **Edge-safe Proxy**: Zero Node.js dependencies in the proxy/middleware path
- **Pages Router**: Existing `appWithTranslation` / `serverSideTranslations` API preserved under `next-i18next/pages`

## Advice:

If you don't like to manage your translation files manually or are simply looking for a [better management solution](https://www.locize.com?utm_source=next_i18next_readme&utm_medium=github&utm_campaign=readme), take a look at [i18next-locize-backend](https://github.com/locize/i18next-locize-backend). The i18next [backend plugin](https://www.i18next.com/overview/plugins-and-utils#backends) for 🌐 [Locize](https://www.locize.com?utm_source=next_i18next_readme&utm_medium=github&utm_campaign=readme) ☁️ — built by the same team behind next-i18next, with CDN delivery (works great on Vercel/serverless), AI translation, and no redeploys for copy changes.

Starting from a Next.js app with hardcoded strings? Run `npx i18next-cli localize` — one command that wraps strings in `t()`, extracts keys, connects to [Locize](https://www.locize.com?from=next-i18next_readme__localize) and AI-translates your app (review the diff for server components). See the [launch post](https://www.locize.com/blog/i18next-cli-localize?from=next-i18next_readme__localize).

---

## Table of Contents

- [App Router Setup](#app-router-setup)
- [No-Locale-Path Mode](#no-locale-path-mode)
- [Mixed Router Setup](#mixed-router-setup-app-router--pages-router)
- [Pages Router Setup](#pages-router-setup)
- [Custom i18next Backends](#custom-i18next-backends)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Migration from v15](#migration-from-v15)

---

## App Router Setup

### 1. Install

```bash
npm install next-i18next i18next react-i18next
```

### 2. Translation files

Place JSON translation files in your project. There are two common patterns:

**In `public/locales/`** (served statically, works with default config — **local/traditional hosting only**):

```
public/locales/en/common.json
public/locales/en/home.json
public/locales/de/common.json
public/locales/de/home.json
```

> **Serverless platforms (Vercel, AWS Lambda, etc.)**: Files in `public/` are served via CDN but are **not** available on the filesystem at runtime. Use `resourceLoader` with dynamic imports instead (see below).

**In `app/i18n/locales/`** (bundled via dynamic imports, requires `resourceLoader` — **works everywhere including serverless**):

```
app/i18n/locales/en/common.json
app/i18n/locales/de/common.json
```

### 3. Configuration

Create a config file (e.g., `i18n.config.ts`):

```ts
import type { I18nConfig } from 'next-i18next/proxy'

const i18nConfig: I18nConfig = {
  supportedLngs: ['en', 'de'],
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'home'],
  // Recommended: works on all platforms including Vercel/serverless
  resourceLoader: (language, namespace) =>
    import(`./app/i18n/locales/${language}/${namespace}.json`),
}

export default i18nConfig
```

The `resourceLoader` uses dynamic `import()` which the bundler can trace, ensuring translation files are included in the serverless function bundle. If you prefer to keep translations in `public/locales/` and are **not** deploying to a serverless platform, you can omit `resourceLoader` — next-i18next will read from the filesystem at runtime.

> **Tip**: Import `I18nConfig` from `next-i18next/proxy` (not from `next-i18next`) to keep the config file Edge-safe.

> **Dev tip — hot-reloading translations**: set `reloadOnPrerender: process.env.NODE_ENV === 'development'` in your config to refetch translations on every render in dev so edits to locale files appear without restarting `next dev`. The flag is automatically a no-op in production, so it is safe to keep in your committed config — custom backends (HTTP, locize, chained) won't be hit per-request in production builds.
>
> **Caveat with `import()`-based `resourceLoader`**: dynamic `import()` of JSON is cached at the bundler level and is not reliably re-invalidated by Turbopack/Webpack HMR after the first edit, so hot-reload can stall after one change. For full hot-reload during development, gate your loader so dev uses `fs.readFile` and production keeps bundler-traceable `import()`:
> ```ts
> const resourceLoader: I18nConfig['resourceLoader'] =
>   process.env.NODE_ENV === 'development'
>     ? async (lng, ns) => {
>         const fs = await import('fs/promises')
>         const path = await import('path')
>         const content = await fs.readFile(
>           path.resolve(process.cwd(), `app/i18n/locales/${lng}/${ns}.json`),
>           'utf-8'
>         )
>         return JSON.parse(content)
>       }
>     : (lng, ns) => import(`./app/i18n/locales/${lng}/${ns}.json`)
> ```
> Pages Router and the App Router default backend already use `fs` and are unaffected.

### 4. Proxy

Create `proxy.ts` at your project root (Next.js 16+ replaces `middleware.ts` with `proxy.ts`):

```ts
import { createProxy } from 'next-i18next/proxy'
import i18nConfig from './i18n.config'

export const proxy = createProxy(i18nConfig)

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|site.webmanifest).*)'],
}
```

> **Note**: `createMiddleware` from `next-i18next/middleware` is still available for projects on Next.js < 16.

The proxy:
- Detects language from cookie > Accept-Language header > fallback
- Redirects bare URLs to locale-prefixed paths (e.g., `/about` -> `/en/about`)
- Sets a custom header (`x-i18next-current-language`) for Server Components

### 5. Root Layout

```tsx
// app/[lng]/layout.tsx
import { initServerI18next, getT, getResources, generateI18nStaticParams } from 'next-i18next/server'
import { I18nProvider } from 'next-i18next/client'
import i18nConfig from '../../i18n.config'

initServerI18next(i18nConfig)

export async function generateStaticParams() {
  return generateI18nStaticParams()
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lng: string }>
}) {
  const { lng } = await params
  const { i18n } = await getT()
  const resources = getResources(i18n)

  return (
    <html lang={lng}>
      <body>
        <I18nProvider language={lng} resources={resources}>
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}
```

Key points:
- `initServerI18next(config)` — call once at module scope in the root layout
- `getResources(i18n)` — serializes loaded translations for client hydration
- `I18nProvider` — wraps children so client components can use `useT()`

### 6. Server Components

```tsx
// app/[lng]/page.tsx
import { getT } from 'next-i18next/server'

export default async function Home() {
  const { t } = await getT('home')
  return <h1>{t('title')}</h1>
}

export async function generateMetadata() {
  const { t } = await getT('home')
  return { title: t('meta_title') }
}
```

For the `Trans` component in Server Components, use `react-i18next/TransWithoutContext` and pass both `t` and `i18n`:

```tsx
import { Trans } from 'react-i18next/TransWithoutContext'
import { getT } from 'next-i18next/server'

export default async function Page() {
  const { t, i18n } = await getT()
  return (
    <Trans t={t} i18n={i18n} i18nKey="welcome">
      Welcome to <strong>next-i18next</strong>
    </Trans>
  )
}
```

### 7. Client Components

```tsx
'use client'
import { useT } from 'next-i18next/client'

export default function Counter() {
  const { t } = useT('home')
  return <button>{t('click_me')}</button>
}
```

`useT` works in both locale-in-path (`/en/about`) and no-locale-path modes. It accepts `[lng]` or `[locale]` as the dynamic route param name.

For the `Trans` component in Client Components:

```tsx
'use client'
import { Trans, useT } from 'next-i18next/client'

export default function Greeting() {
  const { t } = useT()
  return <Trans t={t} i18nKey="greeting">Hello <strong>world</strong></Trans>
}
```

### 8. Language Switching (locale-in-path)

When the locale is part of the URL path (e.g., `/en/about` → `/de/about`), switch languages by navigating to the new locale prefix:

```tsx
'use client'
import { usePathname, useRouter } from 'next/navigation'

export function LanguageSwitcher({ supportedLngs }: { supportedLngs: string[] }) {
  const pathname = usePathname()
  const router = useRouter()

  const switchLocale = (locale: string) => {
    const segments = pathname.split('/')
    segments[1] = locale
    router.push(segments.join('/'))
  }

  return (
    <div>
      {supportedLngs.map((lng) => (
        <button key={lng} onClick={() => switchLocale(lng)}>{lng}</button>
      ))}
    </div>
  )
}
```

For the no-locale-path mode (cookie-based), see `useChangeLanguage` [below](#no-locale-path-mode).

---

## Hide Default Locale

If you want clean URLs for the default language while keeping locale prefixes for other languages, set `hideDefaultLocale: true`:

```ts
const i18nConfig: I18nConfig = {
  supportedLngs: ['en', 'de'],
  fallbackLng: 'en',
  hideDefaultLocale: true,
}
```

In this mode:
- `/about` serves the default language (English) — no prefix needed
- `/de/about` serves German — non-default locales keep their prefix
- `/en/about` automatically redirects to `/about` (canonical clean URL)
- The `[lng]` folder structure stays the same — the proxy rewrites internally

---

## No-Locale-Path Mode

If you prefer clean URLs without a locale prefix for **all** languages (e.g., `/about` instead of `/en/about`), set `localeInPath: false`:

```ts
const i18nConfig: I18nConfig = {
  supportedLngs: ['en', 'de'],
  fallbackLng: 'en',
  localeInPath: false,
  resourceLoader: (language, namespace) =>
    import(`./app/i18n/locales/${language}/${namespace}.json`),
}
```

In this mode:
- Routes live directly under `app/` (no `[lng]` segment)
- The middleware detects language from cookies / Accept-Language, sets the header, but does **not** redirect
- Server Components use `getT()` as usual (language is read from the header)
- Client Components use `useT()` as usual (language comes from `I18nProvider`)
- Use `useChangeLanguage()` for language switching (updates cookie + triggers server re-render):

```tsx
'use client'
import { useChangeLanguage } from 'next-i18next/client'

export function LanguageSwitcher() {
  const changeLanguage = useChangeLanguage()
  return (
    <div>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('de')}>Deutsch</button>
    </div>
  )
}
```

The root layout reads the language from `getT()` instead of URL params:

```tsx
// app/layout.tsx (no [lng] segment)
export default async function RootLayout({ children }) {
  const { i18n, lng } = await getT()
  const resources = getResources(i18n)

  return (
    <I18nProvider language={lng} resources={resources}>
      <html lang={lng}>
        <body>{children}</body>
      </html>
    </I18nProvider>
  )
}
```

See [`examples/app-router-no-locale-path`](examples/app-router-no-locale-path) for a complete example.

---

## Mixed Router Setup (App Router + Pages Router)

For projects that use both routers, next-i18next supports a `basePath` option that scopes the App Router middleware to a specific URL prefix while the Pages Router uses Next.js built-in i18n routing for everything else.

### Configuration

Create a shared config file for common settings:

```js
// i18n.shared.js
module.exports = {
  supportedLngs: ['en', 'de'],
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'footer'],
}
```

App Router config with `basePath`:

```ts
// i18n.config.ts
import type { I18nConfig } from 'next-i18next/proxy'
const shared = require('./i18n.shared.js')

const i18nConfig: I18nConfig = {
  ...shared,
  basePath: '/app-router',
  resourceLoader: (language, namespace) =>
    import(`./public/locales/${language}/${namespace}.json`),
}

export default i18nConfig
```

Pages Router config:

```js
// next-i18next.config.js
const shared = require('./i18n.shared.js')

module.exports = {
  i18n: {
    defaultLocale: shared.fallbackLng,
    locales: shared.supportedLngs,
  },
  localePath:
    typeof window === 'undefined'
      ? require('path').resolve('./public/locales')
      : '/locales',
}
```

### Proxy/Middleware

With `basePath: '/app-router'`, `createProxy` automatically:
- **Skips** any request not under `/app-router/...` (letting Pages Router handle those)
- Redirects `/app-router/page` to `/app-router/en/page`
- Sets the language header for Server Components under that prefix

```ts
// proxy.ts
import { createProxy } from 'next-i18next/proxy'
import i18nConfig from './i18n.config'

export const proxy = createProxy(i18nConfig)

export const config = {
  matcher: ['/app-router/:path*'],
}
```

### next.config.js

Include the Pages Router i18n config so Next.js handles locale routing for Pages:

```js
const { i18n } = require('./next-i18next.config.js')

module.exports = {
  i18n,
  reactStrictMode: true,
}
```

### Directory structure

```
app/app-router/[locale]/layout.tsx    -- App Router layout
app/app-router/[locale]/page.tsx      -- App Router pages
pages/_app.tsx                         -- appWithTranslation
pages/index.tsx                        -- Pages Router pages
public/locales/en/common.json         -- shared translation files
```

App Router pages import from `next-i18next/server` and `next-i18next/client`.
Pages Router pages import from `next-i18next/pages` and `next-i18next/pages/serverSideTranslations`.

See [`examples/mixed-routers`](examples/mixed-routers) for a complete example.

---

## Pages Router Setup

For projects using only the Pages Router, the familiar v15 API is available under `next-i18next/pages`:

```js
// next-i18next.config.js
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
  },
}
```

```js
// next.config.js
const { i18n } = require('./next-i18next.config.js')
module.exports = { i18n }
```

```tsx
// pages/_app.tsx
import { appWithTranslation } from 'next-i18next/pages'

const MyApp = ({ Component, pageProps }) => <Component {...pageProps} />
export default appWithTranslation(MyApp)
```

```tsx
// pages/index.tsx
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { useTranslation } from 'next-i18next/pages'

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default function Home() {
  const { t } = useTranslation('common')
  return <h1>{t('title')}</h1>
}
```

See [`examples/pages-router-simple`](examples/pages-router-simple), [`examples/pages-router-ssg`](examples/pages-router-ssg), and [`examples/pages-router-auto-static-optimize`](examples/pages-router-auto-static-optimize) for more.

---

## Custom i18next Backends

next-i18next supports any i18next backend plugin for loading translations from an API, CDN, or services like [Locize](https://www.locize.com?utm_source=next_i18next_readme&utm_medium=github&utm_campaign=readme).

When a custom backend is provided via `use`, next-i18next will **not** add its default resource loader, giving you full control.

### i18next-http-backend

```ts
import { defineConfig } from 'next-i18next'
import HttpBackend from 'i18next-http-backend'

export default defineConfig({
  supportedLngs: ['en', 'de'],
  fallbackLng: 'en',
  use: [HttpBackend],
  i18nextOptions: {
    backend: {
      loadPath: 'https://cdn.example.com/locales/{{lng}}/{{ns}}.json',
    },
  },
})
```

### i18next-locize-backend

```ts
import { defineConfig } from 'next-i18next'
import LocizeBackend from 'i18next-locize-backend'

export default defineConfig({
  supportedLngs: ['en', 'de'],
  fallbackLng: 'en',
  use: [LocizeBackend],
  i18nextOptions: {
    backend: {
      projectId: 'your-project-id',
      apiKey: 'your-api-key', // only needed for saving missing keys
    },
  },
})
```

### i18next-chained-backend

For client-side caching with a remote fallback:

```ts
import { defineConfig } from 'next-i18next'
import ChainedBackend from 'i18next-chained-backend'
import HttpBackend from 'i18next-http-backend'
import LocalStorageBackend from 'i18next-localstorage-backend'

export default defineConfig({
  supportedLngs: ['en', 'de'],
  fallbackLng: 'en',
  use: [ChainedBackend],
  i18nextOptions: {
    backend: {
      backends: [LocalStorageBackend, HttpBackend],
      backendOptions: [
        { expirationTime: 7 * 24 * 60 * 60 * 1000 },
        { loadPath: '/locales/{{lng}}/{{ns}}.json' },
      ],
    },
  },
})
```

For the client-side `I18nProvider`, pass custom backend plugins via the `use` prop:

```tsx
<I18nProvider
  language={lng}
  resources={resources}
  use={[HttpBackend]}
  i18nextOptions={{
    backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
  }}
>
  {children}
</I18nProvider>
```

### Server-side caching

On the server, next-i18next uses a **module-level singleton** i18next instance:

- Translations are loaded **once** and reused across all subsequent requests
- Custom backends benefit from this — no re-fetching per request
- Additional namespaces are loaded on demand and cached

In **serverless environments** (Lambda, Vercel Serverless, etc.), the cache only lives as long as the warm function instance. For serverless, prefer:
1. Bundling translations at build time via `resources` or `resourceLoader` with dynamic imports
2. Downloading translations in CI/CD via [Locize CLI](https://github.com/locize/locize-cli)

---

## API Reference

### `next-i18next` (root export)

| Export | Description |
|---|---|
| `defineConfig(config)` | Type-safe config helper (identity function) |
| `normalizeConfig(config)` | Fill in defaults and validate config |
| `I18nConfig` | Config type |

### `next-i18next/proxy` (also available as `next-i18next/middleware`)

| Export | Description |
|---|---|
| `createProxy(config)` | Returns a Next.js proxy function (for `proxy.ts`) |
| `createMiddleware(config)` | Alias for `createProxy` (for `middleware.ts` on Next.js < 16) |
| `defineConfig`, `normalizeConfig`, `I18nConfig` | Re-exported for Edge-safe config usage |

### `next-i18next/server`

| Export | Description |
|---|---|
| `initServerI18next(config)` | Initialize server config (call once at module scope) |
| `getT(ns?, options?)` | Get `{ t, i18n }` for Server Components. Options: `{ lng?, keyPrefix? }` |
| `getResources(i18n, namespaces?)` | Extract loaded resources for client hydration |
| `generateI18nStaticParams()` | Returns `[{ lng: 'en' }, { lng: 'de' }, ...]` for `generateStaticParams` |

### `next-i18next/client`

| Export | Description |
|---|---|
| `I18nProvider` | Client-side provider wrapping `I18nextProvider` |
| `useT(ns?, options?)` | Translation hook for Client Components (works in all modes) |
| `useChangeLanguage(cookieName?)` | Language switcher hook for no-locale-path mode |
| `Trans` | Re-exported from `react-i18next` |

### `next-i18next/pages`

| Export | Description |
|---|---|
| `appWithTranslation` | HOC for `_app` |
| `useTranslation` | Translation hook (re-exported from react-i18next) |
| `Trans`, `I18nContext`, `withTranslation` | Re-exported from react-i18next |

### `next-i18next/pages/serverSideTranslations`

| Export | Description |
|---|---|
| `serverSideTranslations(locale, ns?, config?, extraLocales?)` | Load translations for `getStaticProps` / `getServerSideProps` |

### Config Options

| Option | Default | Description |
|---|---|---|
| `supportedLngs` | *required* | Array of supported language codes |
| `fallbackLng` | *required* | Default language |
| `defaultNS` | `'common'` | Default namespace |
| `ns` | `[defaultNS]` | All known namespaces |
| `localeInPath` | `true` | Include locale in URL path |
| `hideDefaultLocale` | `false` | When `true` (with `localeInPath: true`), the default language has no URL prefix |
| `localePath` | `'/locales'` | Path to locale files relative to `/public` |
| `localeStructure` | `'{{lng}}/{{ns}}'` | Locale file directory structure |
| `localeExtension` | `'json'` | Locale file extension |
| `resources` | — | Pre-loaded resources (skips dynamic loading) |
| `resourceLoader` | — | Custom async loader `(lng, ns) => Promise<object>` |
| `basePath` | — | URL prefix for proxy/middleware scoping (e.g., `'/app-router'`) |
| `cookieName` | `'i18next'` | Cookie name for language persistence |
| `headerName` | `'x-i18next-current-language'` | Header name for server-side language passing |
| `cookieMaxAge` | `31536000` (1 year) | Cookie max age in seconds |
| `ignoredPaths` | `['/api', '/_next', '/static']` | Paths the proxy/middleware should skip |
| `use` | `[]` | Extra i18next plugins |
| `i18nextOptions` | `{}` | Additional i18next init options |
| `nonExplicitSupportedLngs` | `false` | Match `'en'` to `'en-US'` etc. |

---

## Examples

| Example | Description |
|---|---|
| [`app-router-simple`](examples/app-router-simple) | App Router with locale-in-path (`/en/...`) |
| [`app-router-no-locale-path`](examples/app-router-no-locale-path) | App Router with cookie-based language (no locale in URL) |
| [`mixed-routers`](examples/mixed-routers) | App Router + Pages Router in the same project |
| [`pages-router-simple`](examples/pages-router-simple) | Pages Router with `getStaticProps` / `getServerSideProps` |
| [`pages-router-ssg`](examples/pages-router-ssg) | Pages Router with static export (`output: 'export'`) |
| [`pages-router-auto-static-optimize`](examples/pages-router-auto-static-optimize) | Pages Router with client-side loading via chained backend |

---

## Migration from v15

### App Router users

If you were using i18next and react-i18next directly (as recommended in v15):

1. `npm install next-i18next@16`
2. Create an `i18n.config.ts` with your languages and namespaces
3. Replace your custom proxy/middleware with `createProxy(config)` in `proxy.ts`
4. Replace your custom `getT` / translation init with `initServerI18next` + `getT` from `next-i18next/server`
5. Replace your custom `I18nProvider` with the one from `next-i18next/client`
6. Replace `useTranslation` with `useT` from `next-i18next/client` in client components

### Pages Router users

1. Update imports from `next-i18next` to `next-i18next/pages`
2. Update `serverSideTranslations` import to `next-i18next/pages/serverSideTranslations`
3. Update type imports: `import type { TFunction, WithTranslation, I18n } from 'next-i18next/pages'`
4. Everything else works the same

---

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/capellini"><img src="https://avatars3.githubusercontent.com/u/75311?v=4?s=100" width="100px;" alt="Rob Capellini"/><br /><sub><b>Rob Capellini</b></sub></a><br /><a href="https://github.com/i18next/next-i18next/commits?author=capellini" title="Code">💻</a> <a href="https://github.com/i18next/next-i18next/commits?author=capellini" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://en.kachkaev.ru"><img src="https://avatars3.githubusercontent.com/u/608862?v=4?s=100" width="100px;" alt="Alexander Kachkaev"/><br /><sub><b>Alexander Kachkaev</b></sub></a><br /><a href="#talk-kachkaev" title="Talks">📢</a> <a href="#question-kachkaev" title="Answering Questions">💬</a> <a href="#ideas-kachkaev" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/i18next/next-i18next/commits?author=kachkaev" title="Code">💻</a> <a href="https://github.com/i18next/next-i18next/commits?author=kachkaev" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://kandelborg.dk"><img src="https://avatars1.githubusercontent.com/u/33042011?v=4?s=100" width="100px;" alt="Mathias Wøbbe"/><br /><sub><b>Mathias Wøbbe</b></sub></a><br /><a href="https://github.com/i18next/next-i18next/commits?author=MathiasKandelborg" title="Code">💻</a> <a href="#ideas-MathiasKandelborg" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/i18next/next-i18next/commits?author=MathiasKandelborg" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://lucasfeliciano.com"><img src="https://avatars3.githubusercontent.com/u/968014?v=4?s=100" width="100px;" alt="Lucas Feliciano"/><br /><sub><b>Lucas Feliciano</b></sub></a><br /><a href="#ideas-lucasfeliciano" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/i18next/next-i18next/pulls?q=is%3Apr+reviewed-by%3Alucasfeliciano" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.fifteenprospects.com"><img src="https://avatars2.githubusercontent.com/u/6932550?v=4?s=100" width="100px;" alt="Ryan Leung"/><br /><sub><b>Ryan Leung</b></sub></a><br /><a href="https://github.com/i18next/next-i18next/commits?author=minocys" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://nathanfriemel.com"><img src="https://avatars3.githubusercontent.com/u/1325835?v=4?s=100" width="100px;" alt="Nathan Friemel"/><br /><sub><b>Nathan Friemel</b></sub></a><br /><a href="https://github.com/i18next/next-i18next/commits?author=nathanfriemel" title="Code">💻</a> <a href="https://github.com/i18next/next-i18next/commits?author=nathanfriemel" title="Documentation">📖</a> <a href="#example-nathanfriemel" title="Examples">💡</a> <a href="#ideas-nathanfriemel" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://isaachinman.com/"><img src="https://avatars.githubusercontent.com/u/10575782?v=4?s=100" width="100px;" alt="Isaac Hinman"/><br /><sub><b>Isaac Hinman</b></sub></a><br /><a href="https://github.com/i18next/next-i18next/commits?author=isaachinman" title="Code">💻</a> <a href="https://github.com/i18next/next-i18next/commits?author=isaachinman" title="Documentation">📖</a> <a href="#ideas-isaachinman" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-isaachinman" title="Maintenance">🚧</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.locize.com/?utm_source=next_i18next_readme&utm_medium=github&utm_campaign=readme"><img src="https://avatars.githubusercontent.com/u/1086194?v=4?s=100" width="100px;" alt="Adriano Raiano"/><br /><sub><b>Adriano Raiano</b></sub></a><br /><a href="https://github.com/i18next/next-i18next/commits?author=adrai" title="Code">💻</a> <a href="https://github.com/i18next/next-i18next/commits?author=adrai" title="Documentation">📖</a> <a href="#ideas-adrai" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-adrai" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/felixmosh"><img src="https://avatars.githubusercontent.com/u/9304194?v=4?s=100" width="100px;" alt="Felix Mosheev"/><br /><sub><b>Felix Mosheev</b></sub></a><br /><a href="#question-felixmosh" title="Answering Questions">💬</a> <a href="https://github.com/i18next/next-i18next/commits?author=felixmosh" title="Code">💻</a> <a href="https://github.com/i18next/next-i18next/commits?author=felixmosh" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://soluble.io/pro"><img src="https://avatars.githubusercontent.com/u/259798?v=4?s=100" width="100px;" alt="Sébastien Vanvelthem"/><br /><sub><b>Sébastien Vanvelthem</b></sub></a><br /><a href="https://github.com/i18next/next-i18next/commits?author=belgattitude" title="Code">💻</a> <a href="https://github.com/i18next/next-i18next/commits?author=belgattitude" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!

---

<h3 align="center">Gold Sponsors</h3>

<p align="center">
  <a href="https://www.locize.com/?utm_source=next_i18next_readme&utm_medium=github&utm_campaign=readme" target="_blank">
    <img src="https://raw.githubusercontent.com/i18next/i18next/master/assets/locize_sponsor_240.gif" width="240px">
  </a>
</p>

---

**localization as a service - [Locize](https://www.locize.com?utm_source=next_i18next_readme&utm_medium=github&utm_campaign=readme)**

Needing a translation management? Want to edit your translations with an InContext Editor? Use the original provided to you by the maintainers of i18next!

**Now with a [Free plan](https://www.locize.com/pricing?utm_source=next_i18next_readme&utm_medium=github&utm_campaign=readme) for small projects!** Perfect for hobbyists or getting started.

![Locize](https://www.locize.com/img/ads/github_locize.png)

By using [Locize](https://www.locize.com/?utm_source=next_i18next_readme&utm_medium=github&utm_campaign=readme) you directly support the future of i18next and next-i18next.

---
