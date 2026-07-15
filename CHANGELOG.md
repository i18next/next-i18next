## 16.0.8

- **Pages Router: self-diagnosing `serverSideTranslations` error** — the "Initial locale argument was not passed into serverSideTranslations" error now names its two common causes (missing `i18n` section in `next.config.js`; pages rendered outside Next.js locale routing such as custom 404/500 or `output: 'export'`) and shows the explicit-locale fix inline.
- **CI: weekly Next.js compatibility workflow** — builds and e2e-tests all example apps against `next@latest` and `next@canary` on a weekly schedule (plus manual dispatch), so upstream Next.js regressions like the 13.5.4 bundling breakage ([#2214](https://github.com/i18next/next-i18next/issues/2214)) surface within days instead of via user reports.

## 16.0.7

- **Pages Router: fix duplicate `i18next` in client bundles** — v16 shipped the Pages Router as CJS-only, which forced bundlers to load `i18next` via its `require` condition (`i18next/dist/cjs`) while user code loaded it via the `import` condition (`i18next/dist/esm`), producing two copies of i18next in the same bundle. The Pages Router now builds dual ESM + CJS outputs, and the `./pages` and `./pages/serverSideTranslations` exports declare matching `import`/`require` conditions. The server-only filesystem branch of `createConfig` has been extracted into a separate `serverSideConfig` module (injected via hook by `serverSideTranslations`) so `createConfig` no longer pulls Node built-ins into client bundles. Note: `appWithTranslation` no longer re-runs the server-side validation/preload during SSR — that work happens once, up-front, inside `serverSideTranslations` (in practice a no-op since `appWithTranslation` uses the browser client with pre-loaded resources). [#2342](https://github.com/i18next/next-i18next/issues/2342)

## 16.0.6

- **Pages Router: `reloadOnPrerender` now actually reloads** — the option was previously calling `reloadResources()` on the browser-side i18next instance returned by `appWithTranslation` (which has no FS backend and is often `null` during `getStaticProps`/`getServerSideProps`). It now reloads on the disk-backed node-side instance, scoped to exactly the locales × namespaces being shipped, so edits to locale files appear without restarting `next dev`. Gated behind `NODE_ENV !== 'production'` to keep custom HTTP/locize/chained backends from being refetched on every prerender call. [#2123](https://github.com/i18next/next-i18next/issues/2123)
- **App Router: `reloadOnPrerender` is now wired up** — previously declared in the config types but never consumed. Same dev-only semantics as Pages Router: refetches translations from the configured backend (default FS or `use`-provided custom backend) before each render in development, deduplicated across `getT` calls within a single render via React's `cache()`. No effect in production builds. Note: when using a dynamic `import()`-based `resourceLoader`, hot-reload is bundler-dependent and may stall after the first edit because Turbopack/Webpack cache resolved JSON modules across HMR cycles — see the README "Dev tip" for the dev/prod-split pattern that gives full hot-reload.

## 16.0.5

- **Pages Router: export missing types from `next-i18next/pages`** — `TFunction`, `I18n`, `WithTranslation`, `WithTranslationHocType`, and `UseTranslation` types are now properly re-exported, matching the v15 API surface [#2339](https://github.com/i18next/next-i18next/issues/2339)

## 16.0.4

- **TypeScript compatibility with i18next v26** — fixed type error in Pages Router `createConfig` where i18next v26's readonly `preload` type was incompatible with the internal config type

## 16.0.3

- **New `hideDefaultLocale` option (App Router)** — when enabled, the default language is served without a URL prefix (`/about` instead of `/en/about`). Non-default locales keep their prefix (`/de/about`). Explicit default-locale paths (`/en/about`) are automatically redirected to the clean URL. Works with `basePath` too. [#2338](https://github.com/i18next/next-i18next/issues/2338)

## 16.0.2

- **Serverless/Vercel: better error when `public/locales/` is not available at runtime** — the default filesystem backend now catches read failures and shows a clear error message explaining the serverless limitation with a `resourceLoader` code example [#2337](https://github.com/i18next/next-i18next/issues/2337)
- **`partialBundledLanguages` + `resources`** — when both `resources` and `partialBundledLanguages: true` are provided, the default backend is now correctly kept so it can load additional namespaces not included in the pre-loaded resources

## 16.0.1

- **App Router: `config.resources` now works on the server** — `resources` was typed and documented but ignored at runtime by `initServerI18next` / `getT`. The resource backend is now skipped when `resources` is provided, and the pre-loaded translations are passed directly to `i18next.init()`. [#2336](https://github.com/i18next/next-i18next/issues/2336)

## 16.0.0

### BREAKING CHANGES

- **Import paths changed for Pages Router**: `next-i18next` → `next-i18next/pages`, `next-i18next/serverSideTranslations` → `next-i18next/pages/serverSideTranslations`
- **Root export is now App Router**: The default `next-i18next` import now exports App Router utilities (`defineConfig`, `normalizeConfig`, `I18nConfig`). Pages Router users must update to `next-i18next/pages`.
- **Removed `i18next-fs-backend` dependency**: Pages Router server-side loading now uses `i18next-resources-to-backend` with `fs.readFileSync` internally. No change needed for users — the behavior is identical.

### New Features

- **App Router support** — first-class support for Next.js App Router with Server Components and Client Components
  - `getT(ns?, options?)` — async translation function for Server Components, layouts, and `generateMetadata`. Returns namespace-typed `{ t, i18n, lng }`.
  - `useT(ns?, options?)` — translation hook for Client Components. Reads language from `[lng]` or `[locale]` URL params automatically.
  - `I18nProvider` — client-side provider for hydrating server-loaded translations. Supports custom backends via `use` prop.
  - `initServerI18next(config)` — one-time server configuration setup
  - `getResources(i18n, namespaces?)` — extract loaded resources for client hydration
  - `generateI18nStaticParams()` — helper for `generateStaticParams`
- **Proxy support (Next.js 16+)** — `createProxy()` from `next-i18next/proxy` for the new `proxy.ts` file convention. `createMiddleware()` from `next-i18next/middleware` remains available for Next.js 14/15.
  - Edge-safe language detection (cookie → Accept-Language → fallback)
  - Locale-in-path routing with automatic redirects
  - Custom header for Server Component language detection
- **`basePath` option** — scope the proxy to a URL prefix (e.g., `/app-router`) for mixed App Router + Pages Router setups
- **No-locale-path mode** — `localeInPath: false` for cookie-based language without URL prefixes. Use `useChangeLanguage()` hook for language switching.
- **`defineConfig()`** — type-safe configuration helper
- **Custom backend support** — pass any i18next backend plugin (http-backend, locize-backend, chained-backend) via the `use` config option. The default resource loader is skipped automatically when a custom backend is provided.
- **`resourceLoader` option** — custom async loader function `(lng, ns) => Promise<object>` for dynamic imports or custom loading logic
- **Server-side singleton caching** — translations loaded once and reused across requests. Custom backends benefit from this — no re-fetching per request.
- **`nonExplicitSupportedLngs`** — match `'en'` to `'en-US'` etc. in language detection

### Pages Router

- All existing v15 APIs preserved under `next-i18next/pages` and `next-i18next/pages/serverSideTranslations`
- `appWithTranslation`, `useTranslation`, `Trans`, `serverSideTranslations` — unchanged behavior
- Defensive `.filter(Boolean)` on `config.use` arrays to handle CJS/ESM interop edge cases with Turbopack

## 15.4.3

- types: fix: WithTranslation type from next-i18next is not generic (TS error) [#2329](https://github.com/i18next/next-i18next/issues/2329)

## 15.4.2

- types: re-add @types/hoist-non-react-statics to dependencies [#2316](https://github.com/i18next/next-i18next/pull/2316)

## 15.4.1

- Move @types/hoist-non-react-statics to devDependencies [#2310](https://github.com/i18next/next-i18next/pull/2310)

## 15.4.0

- support i18next v24

## 15.3.1

- update some i18next dependencies to address [#2288](https://github.com/i18next/next-i18next/issues/2288)

## 15.3.0

- Only overwrite ns config if it provided [#2270](https://github.com/i18next/next-i18next/pull/2270)

## 15.2.0

- add possibility to pass resources directly via config and set localePath to null

## 15.1.2

- fix: Install error with react-i18next v14 [#2248](https://github.com/i18next/next-i18next/issues/2248)

## 15.1.1

- optimize/fix last change for turbo

## 15.1.0

- try to fix for turbo [#2222](https://github.com/i18next/next-i18next/issues/2222)

## 15.0.0

- refactor: reuse existing i18next instance [#2226](https://github.com/i18next/next-i18next/pull/2226)
  -> If you use client side pages (not lazy loading translations), like described [here](https://github.com/i18next/i18next-http-backend/tree/master/example/next#4-setup-your-client-rendered-pagescomponents), make sure you set the `partialBundledLanguages` option to true, like [here](https://github.com/i18next/i18next-http-backend/tree/master/example/next#4-setup-your-client-rendered-pagescomponents).

## 14.0.3

- fix: correct namespacesRequired type in serverSideTranslations [#2203](https://github.com/i18next/next-i18next/pull/2201)

## 14.0.2

- try to fix namespacesRequired in serverSideTranslations is not type-safe anymore [#2201](https://github.com/i18next/next-i18next/issues/2201)

## 14.0.0

- requires i18next >= v23.0.1
- requires react-i18next >= v13.0.0

### Breaking changes

[i18next 23.0.0](https://github.com/i18next/i18next/releases/tag/v23.0.0) dropped support for older browsers.
From nextjs 13, you can use the [transpilePackages](https://nextjs.org/docs/app/api-reference/next-config-js/transpilePackages)
to avoid issues.

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['i18next'],
}
module.exports = nextConfig
```

## 13.3.0

- using a custom backend on server side should also lazy load the passed namespaces

## 13.2.2

- pageProps may be undefined on strange setups [#2109](https://github.com/i18next/next-i18next/issues/2109)"

## 13.2.1

- types: fix serverSideTranslations args [#2104](https://github.com/i18next/next-i18next/pull/2104)"

## 13.2.0

- types: Update serverSideTranslation args type [#2097](https://github.com/i18next/next-i18next/pull/2097)"

## 13.1.6

- fix: allow user provided affixes to be used without providing localeStructure [#2100](https://github.com/i18next/next-i18next/pull/2100)"

## 13.1.5

- [#2089](https://github.com/i18next/next-i18next/pull/2089), more stable impelementation of "feat(server-side): custom default config path [#2084](https://github.com/i18next/next-i18next/pull/2084)"

## 13.1.4

- revert #2084

## 13.1.3

- another code snippet for #2084 to try to fix for dynamic pages

## 13.1.2

- different code snippet for #2084 to try to fix for dynamic pages

## 13.1.1

- log config path if no config found

## 13.1.0

- feat(server-side): custom default config path [#2084](https://github.com/i18next/next-i18next/pull/2084)

## 13.0.3

- Error if custom localeStructure provided, but no ns option defined.

## 13.0.2

### Fix

- Types: DefaultNamespace import, see [#2061](https://github.com/i18next/next-i18next/pull/2061).

## 13.0.1

### Fix

- Fix missing `i18n.localeDetection` in UserConfig, see [#2057](https://github.com/i18next/next-i18next/pull/2057).
- Update examples to latest i18next in [#2058](https://github.com/i18next/next-i18next/pull/2058)

**Caution**

If you're experiencing typecheck errors regarding keys: ensure `i18next` is at least `^22.4.3` in your
package.json (then run install), see [#2058](https://github.com/i18next/next-i18next/pull/2058).

## 13.0.0

The v13.0.0 release is a major version to improve stability and general experience.
It comes with 2 easy changes related to installation. Existing code shouldn't be impacted.
Details can be found in the [UPGRADING.md](https://github.com/i18next/next-i18next/blob/master/UPGRADING.md#version-1300) document.

### Breaking changes

- [react-i18next](https://github.com/i18next/react-i18next) and [i18next](https://github.com/i18next/i18next)
  have been moved to peer-dependencies. They must be installed
  in your app ([#1966](https://github.com/i18next/next-i18next/pull/1966))

  ```bash
  # Add react-i18next > 12.0.0 and i18next > 22.0.4 to your app dependencies
  npm install react-i18next i18next --save  # NPM
  yarn add react-i18next i18next            # Yarn
  pnpm add react-i18next i18next --save     # PNPM
  ```

  This might solve issues with duplicates and multiple i18n context instances.
  If you encounter any issue, please read the [Troubleshoot](https://github.com/i18next/next-i18next/blob/master/TROUBLESHOOT.md) doc
  before posting an issue.

- Types augmentations are now handled by i18next instead of react-i18next ([#1997](https://github.com/i18next/next-i18next/pull/1997)).
  See the upgrade [document here](https://github.com/i18next/next-i18next/blob/master/UPGRADING.md#keys-typings).

### New

- Support for NextJs 13 (excluding new experimental layout / rsc)
- Upgrade to [i18next v22](https://github.com/i18next/i18next/releases) and react-i18next v12, see [#1966](https://github.com/i18next/next-i18next/pull/1966)
- Support for node 18 lts [#2017](https://github.com/i18next/next-i18next/pull/2017)

### Fix

- Fix types for appWithTranslation [#1987](https://github.com/i18next/next-i18next/pull/1987)

### New minimum versions

We've dropped support for nextjs < 12.0.0 / react < 17.0.2 ([#1983](https://github.com/i18next/next-i18next/pull/1983))
and node < 14 ([#1974](https://github.com/i18next/next-i18next/pull/1974)).

## 12.1.0

- fix: appWithTranslation re-renders \_app when the locale is changed (#1954)
- feat: introduce onPreInitI18next option (#1960)

## 12.0.1

- fix: fallbackLng if namespaces are undefined (#1943 closes #1941)

## 12.0.0

**Why a major version?**
The following changes could lead to more languages being loaded, which could increase the page size.

- feat: improve fallback language handling (#1927)
- feat: add support for nonExplicitSupportedLngs (#1930)

## 11.3.0

- feat: introduce extraLocales (#1916)

## 11.2.2

- fix: pass namespaces to the client also for custom backends (#1913)

## 11.2.1

- fix: pass namespaces to the client (#1912 closes #1839)

## 11.2.0

- feat: support nested namespace structure (#1911)

## 11.1.1

- fix: remove postinstall script

## 11.1.0

- first release with new project ownership
- update most dependencies
- update docs and example
- feat: support default locale by ignoring it (#1679)

## 11.0.0

**Features:**

- Allow client side translation loading (8132efd)

**Documentation:**

- Link to `react-i18next` config options (422a0f3)
