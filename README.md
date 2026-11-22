# next-i18next

[![npm version](https://img.shields.io/npm/v/next-i18next.svg?style=flat-square)](https://www.npmjs.com/package/next-i18next)
![npm](https://img.shields.io/npm/dw/next-i18next)
[![Socket Badge](https://badge.socket.dev/npm/package/next-i18next)](https://socket.dev/npm/package/next-i18next)

**The easiest way to translate your Next.js apps.**

Supports the **App Router** (Server Components, Client Components, the proxy), the **Pages Router**, and **mixed** setups where both routers coexist.

If you already know i18next: next-i18next v16 is a thin layer on top of [i18next](https://www.i18next.com) and [react-i18next](https://www.i18next.com/react) that handles the Next.js-specific wiring (the proxy, the server/client split, handing the translations to the browser), so you don't have to.

**Documentation: [www.i18next.com/next](https://www.i18next.com/next)**

## Advice:

If you don't like to manage your translation files manually or are simply looking for a [better management solution](https://www.locize.com?utm_source=next_i18next_readme&utm_medium=github&utm_campaign=readme), take a look at [i18next-locize-backend](https://github.com/locize/i18next-locize-backend). The i18next [backend plugin](https://www.i18next.com/overview/plugins-and-utils#backends) for 🌐 [Locize](https://www.locize.com?utm_source=next_i18next_readme&utm_medium=github&utm_campaign=readme) ☁️ — built by the same team behind next-i18next, with CDN delivery (works great on Vercel/serverless), AI translation, and no redeploys for copy changes.

Starting from a Next.js app with hardcoded strings? Run `npx i18next-cli localize`: one command that wraps strings in `t()` (since i18next-cli 1.90 with `await getT()` in Server Components and `useT()` in Client Components; review the diff and the warnings), extracts keys, connects to [Locize](https://www.locize.com?from=next-i18next_readme__localize) and AI-translates your app. See the [launch post](https://www.locize.com/blog/i18next-cli-localize?from=next-i18next_readme__localize).

Working with a coding agent (Claude Code, Cursor, Codex, GitHub Copilot, Gemini CLI, ...)? Paste this prompt; the CLI prints the steps for its installed version, you review the diff, and the translation files stay in your repository unless you choose otherwise ([what the prompt tells your agent](https://www.i18next.com/how-to/ai-coding-agents)):

```text
Localize this app with i18next.
Run `npx i18next-cli localize --print-agent-prompt` and follow
the steps it prints, in order, checking each one before the next.
```

## Install

```bash
npm install next-i18next i18next react-i18next
```

## Where to start

- **A new App Router app:** [App Router setup](https://www.i18next.com/next/app-router/setup): the translation files, `i18n.config.ts`, the proxy, a server module with `createServerI18next`, the root layout, then `getT()` in Server Components and `useT()` in Client Components. Then choose how the language shows in the address: in the path (`/de/about`, the default), [without a prefix for the default language](https://www.i18next.com/next/app-router/hide-default-locale), [only in a cookie](https://www.i18next.com/next/app-router/no-locale-path), or [clean addresses that still prerender](https://www.i18next.com/next/app-router/internal-locale-mode).
- **An app on the Pages Router:** [Pages Router setup](https://www.i18next.com/next/pages-router/setup).
- **Both routers in one app:** [Mixed routers](https://www.i18next.com/next/guides/mixed-routers).
- **Coming from v15:** [Migration from v15](https://www.i18next.com/next/reference/migration-from-v15).
- **Complete projects:** the [examples](#examples) below.

## i18next-locize-backend

To load the translations from [Locize](https://www.locize.com?utm_source=next_i18next_readme&utm_medium=github&utm_campaign=readme), the translation management service by the i18next maintainers, add [i18next-locize-backend](https://github.com/locize/i18next-locize-backend) to `use` in your config:

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

The `apiKey` is only needed to save missing keys: put it into development builds, never into production. Everything else works as with any i18next backend: [Custom backends](https://www.i18next.com/next/guides/backends) shows the server config, the backend for `I18nProvider` in the browser, and why backends stay out of the server render.

## Moved to www.i18next.com

The sections that were in this README are pages of the documentation now:

| Section | Now |
| --- | --- |
| <a name="whats-new-in-v16"></a>What's new in v16 | [Introduction](https://www.i18next.com/next#what-v16-brings) |
| <a name="app-router-setup"></a><a name="1-install"></a><a name="2-translation-files"></a><a name="3-configuration"></a><a name="4-proxy"></a><a name="6-root-layout"></a><a name="with-initserveri18next-instead"></a><a name="7-server-components"></a><a name="8-client-components"></a><a name="9-language-switching-locale-in-path"></a>App Router setup | [App Router setup](https://www.i18next.com/next/app-router/setup) |
| <a name="5-server-module"></a>Server module | [App Router setup, step 5](https://www.i18next.com/next/app-router/setup#5-server-module) |
| <a name="hide-default-locale"></a>Hide default locale | [Hide default locale](https://www.i18next.com/next/app-router/hide-default-locale) |
| <a name="translated-paths"></a>Translated paths | [Translated paths](https://www.i18next.com/next/app-router/translated-paths) |
| <a name="no-locale-path-mode"></a>No-locale-path mode | [No-locale-path mode](https://www.i18next.com/next/app-router/no-locale-path) |
| <a name="internal-locale-mode-clean-urls--static-prerendering"></a>Internal locale mode | [Internal locale mode](https://www.i18next.com/next/app-router/internal-locale-mode) |
| <a name="static-export-output-export"></a>Static export | [Static export](https://www.i18next.com/next/app-router/static-export) |
| <a name="loading-languages-on-demand"></a>Loading languages on demand | [Loading languages on demand](https://www.i18next.com/next/app-router/loading-on-demand) |
| <a name="icu-and-mf2-with-the-app-router"></a>ICU and MF2 with the App Router | [ICU and MF2](https://www.i18next.com/next/app-router/icu-and-mf2) |
| <a name="mixed-router-setup-app-router--pages-router"></a><a name="nextconfigjs"></a><a name="directory-structure"></a><a name="proxymiddleware"></a>Mixed router setup | [Mixed routers](https://www.i18next.com/next/guides/mixed-routers) |
| <a name="pages-router-setup"></a><a name="setup"></a><a name="next-i18nextconfigjs"></a><a name="serversidetranslations"></a><a name="appwithtranslation"></a><a name="usetranslation"></a>Pages Router setup | [Pages Router setup](https://www.i18next.com/next/pages-router/setup) |
| <a name="fallback-locales"></a>Fallback locales | [Pages Router setup, fallback locales](https://www.i18next.com/next/pages-router/setup#fallback-locales) |
| <a name="usage-with-fallback-ssg-pages"></a>Fallback SSG pages | [Pages Router setup, fallback SSG pages](https://www.i18next.com/next/pages-router/setup#usage-with-fallback-ssg-pages) |
| <a name="client-side-loading-of-translations-via-http"></a>Loading translations on the client | [Pages Router setup, loading translations on the client](https://www.i18next.com/next/pages-router/setup#client-side-loading-of-translations-via-http) |
| <a name="reloading-resources-in-development"></a>Reloading in development | [Pages Router setup, reloading in development](https://www.i18next.com/next/pages-router/setup#reloading-resources-in-development) |
| <a name="missing-keys-savemissing"></a>Missing keys with saveMissing | [Pages Router setup, missing keys with saveMissing](https://www.i18next.com/next/pages-router/setup#missing-keys-savemissing) |
| <a name="vercel-and-netlify"></a>Vercel and Netlify | [Pages Router setup, Vercel and Netlify](https://www.i18next.com/next/pages-router/setup#vercel-and-netlify) |
| <a name="docker"></a>Docker | [Pages Router setup, Docker](https://www.i18next.com/next/pages-router/setup#docker) |
| <a name="unserializable-configs"></a>Unserializable configs | [Pages Router setup, unserializable configs](https://www.i18next.com/next/pages-router/setup#unserializable-configs) |
| <a name="pages-router-options"></a>Pages Router options | [Config options](https://www.i18next.com/next/reference/configuration#pages-router-options) |
| <a name="multi-tenant-setups"></a>Multi-tenant setups | [Multi-tenant setups](https://www.i18next.com/next/guides/multi-tenant) |
| <a name="custom-i18next-backends"></a><a name="i18next-http-backend"></a><a name="i18next-chained-backend"></a><a name="server-side-caching"></a>Custom i18next backends | [Custom backends](https://www.i18next.com/next/guides/backends) |
| <a name="api-reference"></a><a name="next-i18next-root-export"></a><a name="next-i18nextproxy-also-available-as-next-i18nextmiddleware"></a><a name="next-i18nextserver"></a><a name="next-i18nextclient"></a><a name="next-i18nexticu-and-next-i18nextmf2"></a><a name="next-i18nextpages"></a><a name="next-i18nextpagesserversidetranslations"></a>API reference | [API reference](https://www.i18next.com/next/reference/api) |
| <a name="config-options"></a><a name="options"></a>Config options | [Config options](https://www.i18next.com/next/reference/configuration) |
| <a name="migration-from-v15"></a><a name="app-router-users"></a><a name="pages-router-users"></a>Migration from v15 | [Migration from v15](https://www.i18next.com/next/reference/migration-from-v15) |

## Examples

| Example | Description |
|---|---|
| [`app-router-simple`](examples/app-router-simple) | App Router with locale-in-path (`/en/...`) |
| [`app-router-no-locale-path`](examples/app-router-no-locale-path) | App Router with cookie-based language (no locale in URL) |
| [`app-router-icu`](examples/app-router-icu) | App Router with ICU MessageFormat: plurals, select and rich text in Server and Client Components |
| [`mixed-routers`](examples/mixed-routers) | App Router + Pages Router in the same project |
| [`pages-router-simple`](examples/pages-router-simple) | Pages Router with `getStaticProps` / `getServerSideProps` |
| [`pages-router-ssg`](examples/pages-router-ssg) | Pages Router with static export (`output: 'export'`) |
| [`pages-router-auto-static-optimize`](examples/pages-router-auto-static-optimize) | Pages Router with client-side loading via chained backend |

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

By using [Locize](https://www.locize.com/?utm_source=next_i18next_readme&utm_medium=github&utm_campaign=readme) you directly support the future of i18next and next-i18next.

---
