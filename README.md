# next-i18next

[![CircleCI](https://circleci.com/gh/i18next/next-i18next.svg?style=shield)](https://circleci.com/gh/i18next/next-i18next)
[![Package Quality](https://npm.packagequality.com/shield/next-i18next.svg)](https://packagequality.com/#?package=next-i18next)
[![npm version](https://img.shields.io/npm/v/next-i18next.svg?style=flat-square)](https://www.npmjs.com/package/next-i18next)
![npm](https://img.shields.io/npm/dw/next-i18next)

**The easiest way to translate your Next.js apps *(with pages setup)*.**

If you are using next-i18next *(pages directory)* in production and like to unleash some super powers, you may have a look at [this blog post](https://locize.com/blog/next-i18next/).
[![](https://locize.com/blog/next-i18next/next-i18next.jpg)](https://locize.com/blog/next-i18next/)

If you're using Next.js 13/14 with app directory, there is no need for next-i18next, you can directly use i18next and react-i18next, like described [in this blog post](https://locize.com/blog/next-app-dir-i18n/).
[![](https://locize.com/blog/next-app-dir-i18n/next-app-dir-i18n.jpg)](https://locize.com/blog/next-app-dir-i18n/)

## What is this?

Although Next.js [provides internationalised routing directly](https://nextjs.org/docs/advanced-features/i18n-routing), it does not handle any management of translation content, or the actual translation functionality itself. All Next.js does is keep your locales and URLs in sync.

To complement this, `next-i18next` provides the remaining functionality – management of translation content, and components/hooks to translate your React components – while fully supporting SSG/SSR, multiple [namespaces](https://www.i18next.com/principles/namespaces), codesplitting, etc.

While `next-i18next` uses [i18next](https://www.i18next.com/) and [react-i18next](https://github.com/i18next/react-i18next) under the hood, users of `next-i18next` simply need to include their translation content as JSON files and don't have to worry about much else.

A live demo is [available here](https://next.i18next.com/). This demo app is the [simple example](./examples/simple/) - nothing more, nothing less.

## Why next-i18next?

Easy to set up, easy to use: setup only takes a few steps, and configuration is simple.

No other requirements: `next-i18next` simplifies internationalisation for your [Next.js](https://nextjs.org/) app without extra dependencies.

Production ready: `next-i18next` supports passing translations and configuration options into pages as props with SSG/SSR support.

## How does it work?

Your `next-i18next.config.js` file will provide configuration for `next-i18next`.
After configuration, `appWithTranslation` allows us to use the `t` (translate) function in our components via hooks.

Then we add `serverSideTranslation` to [getStaticProps](https://nextjs.org/docs/basic-features/data-fetching#getstaticprops-static-generation) or [getServerSideProps](https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering) (depending on your case) in our page-level components.

Now our Next.js app is fully translatable!

## Setup

### 1. Installation

```bash
yarn add next-i18next react-i18next i18next
```

You need to also have `react` and `next` installed.

### 2. Translation content

By default, `next-i18next` expects your translations to be organised as such:

```
.
└── public
    └── locales
        ├── en
        |   └── common.json
        └── de
            └── common.json
```

This structure can also be seen in the [simple example](./examples/simple).

If you want to structure your translations/namespaces in a custom way, you will need to pass modified `localePath` and `localeStructure` values into the initialisation config.

### 3. Project setup

First, create a `next-i18next.config.js` file in the root of your project. The syntax for the nested `i18n` object [comes from Next.js directly](https://nextjs.org/docs/advanced-features/i18n-routing).

This tells `next-i18next` what your `defaultLocale` and other locales are, so that it can preload translations on the server:

#### `next-i18next.config.js`

```js
/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
  },
}
```

Now, create or modify your `next.config.js` file, by passing the `i18n` object into your `next.config.js` file, to enable localised URL routing:

#### [`next.config.js`](https://nextjs.org/docs/api-reference/next.config.js/introduction)

```js
const { i18n } = require('./next-i18next.config')

module.exports = {
  i18n,
}
```

There are three functions that `next-i18next` exports, which you will need to use to translate your project:

#### appWithTranslation

This is a HOC which wraps your [`_app`](https://nextjs.org/docs/advanced-features/custom-app):

```tsx
import { appWithTranslation } from 'next-i18next'

const MyApp = ({ Component, pageProps }) => (
  <Component {...pageProps} />
)

export default appWithTranslation(MyApp)
```

The `appWithTranslation` HOC is primarily responsible for adding a [`I18nextProvider`](https://react.i18next.com/latest/i18nextprovider).

#### serverSideTranslations

This is an async function that you need to include on your page-level components, via either [`getStaticProps`](https://nextjs.org/docs/basic-features/data-fetching#getstaticprops-static-generation) or [`getServerSideProps`](https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering) (depending on your use case):

```tsx
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'common',
        'footer',
      ])),
      // Will be passed to the page component as props
    },
  }
}
```

Note that `serverSideTranslations` must be imported from `next-i18next/serverSideTranslations` – this is a separate module that contains NodeJs-specific code.

Also, note that `serverSideTranslations` is not compatible with `getInitialProps`, as it _only_ can execute in a server environment, whereas `getInitialProps` is called on the client side when navigating between pages.

The `serverSideTranslations` HOC is primarily responsible for passing translations and configuration options into pages, as props – you need to add it to any page that has translations.

### useTranslation

This is the hook which you'll actually use to do the translation itself. The `useTranslation` hook [comes from `react-i18next`](https://react.i18next.com/latest/usetranslation-hook), but needs to be imported from `next-i18next` directly.
<br/>
**Do NOT use the `useTranslation` export of `react-i18next`, but ONLY use the one from `next-i18next`!**

```tsx
import { useTranslation } from 'next-i18next'

export const Footer = () => {
  const { t } = useTranslation('footer')

  return (
    <footer>
      <p>{t('description')}</p>
    </footer>
  )
}
```

### 4. Declaring namespace dependencies

By default, `next-i18next` will send _all your namespaces_ down to the client on each initial request. This can be an appropriate approach for smaller apps with less content, but a lot of apps will benefit from splitting namespaces based on route.

To do that, you can pass an array of required namespaces for each page into `serverSideTranslations`. You can see this approach in [examples/simple/pages/index.tsx](./examples/simple/pages/index.tsx). Passing in an empty array of required namespaces will send no namespaces.

Note: `useTranslation` provides namespaces to the component that you use it in. However, `serverSideTranslations` provides the total available namespaces to the entire React tree and belongs on the page level. Both are required.

### 5. Declaring locale dependencies

By default, `next-i18next` will send _only the active locale_ down to the client on each request. This helps reduce the size of the
initial payload sent to the client. However in some cases one may need the translations for other languages at runtime too. For example
when using [getFixedT](https://www.i18next.com/overview/api#getfixedt) of `useTranslation` hook.

To change the behavior and load extra locales just pass in an array of locales as the last argument to `serverSideTranslations`.

```diff
  import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

  export async function getStaticProps({ locale }) {
    return {
      props: {
-       ...(await serverSideTranslations(locale, ['common', 'footer'])),
+       ...(await serverSideTranslations(locale, ['common', 'footer'], null, ['en', 'no'])),
      },
    };
  }
```

As a result the translations for both `no` and `en` locales will always be loaded regardless of the current language.

> Note: The extra argument should be added to all pages that use `getFixedT` function.

#### Fallback locales

By default, `next-i18next` will add the `defaultLocale` as fallback. To change this, you can set [`fallbackLng`](https://www.i18next.com/principles/fallback). All values supported by `i18next` (`string`, `array`, `object` and `function`) are supported by `next-i18next` too.

Additionally `nonExplicitSupportedLngs` can be set to `true` to support all variants of a language, without the need to provide JSON files for each of them. Notice that all variants still must be included in `locales` to enable routing within `next.js`.

> Note: `fallbackLng` and `nonExplicitSupportedLngs` can be used at once. There is only one exception: You can not use a function for `fallbackLng` when `nonExplicitSupportedLngs` is `true`,

```js
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'de-AT', 'de-DE', 'de-CH'],
  },
  fallbackLng: {
    default: ['en'],
    'de-CH': ['fr'],
  },
  nonExplicitSupportedLngs: true,
  // de, fr and en will be loaded as fallback languages for de-CH
}
```

Be aware that using `fallbackLng` and `nonExplicitSupportedLngs` can easily increase the initial size of the page.

fyi: Setting `fallbackLng` to `false` will NOT serialize your fallback language (usually `defaultLocale`). This will decrease the size of your initial page load.

### 6. Advanced configuration

#### Passing other config options

If you need to modify more advanced configuration options, you can pass them via `next-i18next.config.js`. For example:

```js
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
  },
  localePath:
    typeof window === 'undefined'
      ? require('path').resolve('./my-custom/path')
      : '/public/my-custom/path',
  ns: ['common'],
}
```

#### Unserializable configs

Some `i18next` plugins (which you can pass into `config.use`) are unserializable, as they contain functions and other JavaScript primitives.

You may run into this if your use case is more advanced. You'll see Next.js throw an error like:

```
Error: Error serializing `._nextI18Next.userConfig.use[0].process` returned from `getStaticProps` in "/my-page".
Reason: `function` cannot be serialized as JSON. Please only return JSON serializable data types.
```

To fix this, you'll need to set `config.serializeConfig` to `false`, and manually pass your config into `appWithTranslation`:

```tsx
import { appWithTranslation } from 'next-i18next'
import nextI18NextConfig from '../next-i18next.config.js'

const MyApp = ({ Component, pageProps }) => (
  <Component {...pageProps} />
)

export default appWithTranslation(MyApp, nextI18NextConfig)
```

```tsx
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import nextI18NextConfig from '../next-i18next.config.js'

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(
      locale,
      ['common', 'footer'],
      nextI18NextConfig
    )),
  },
})
```

#### Usage with fallback SSG pages 

When using on server-side generated pages with [`getStaticPaths`](https://nextjs.org/docs/pages/api-reference/functions/get-static-paths) and [`fallback: true`](https://nextjs.org/docs/pages/api-reference/functions/get-static-paths#fallback-true) or [`fallback: 'blocking'`](https://nextjs.org/docs/pages/api-reference/functions/get-static-paths#fallback-blocking), the default setup indicated above will cause the app to be unmounted and remounted on every load, causing various adverse consequences like calling every `useEffect(() => {...}, [])` hook twice and slight performance degradation.

This is due to the fact that, for those pages, Next.js does a first render with empty `serverSideProps` and then a second render with the `serverSideProps` that include the `next-i18next` translations. With the default setup, the `i18n` instance is initially `undefined` when `serverSideProps` is `empty`, causing the unmount-remount.

To mitigate this issue, you can do the following:

```tsx
import { UserConfig } from 'next-i18next';
import nextI18NextConfig from '../next-i18next.config.js'

const emptyInitialI18NextConfig: UserConfig = {
  i18n: {
    defaultLocale: nextI18NextConfig.i18n.defaultLocale,
    locales: nextI18NextConfig.i18n.locales,
  },
};

const MyApp = ({ Component, pageProps }) => (
  <Component {...pageProps} />
)

export default appWithTranslation(MyApp, emptyInitialI18NextConfig) // Makes sure the initial i18n instance is not undefined
```

This will work as long as you make sure that, in the fallback page state, your client-side code is not trying to display any translation since otherwise you will get a "server-client mismatch" error from Next.js (due to the fact that the server has an actual translation in its html while the client html has the translation key in the same place).   
This is normal and fine: you shouldn't be displaying a translation key to your user anyway!

#### Client side loading of translations via HTTP

Since [v11.0.0](https://github.com/i18next/next-i18next/releases/tag/v11.0.0) next-i18next also provides support for client side loading of translations.

In some use cases, you might want to load a translation file dynamically without having to use `serverSideTranslations`. This can be especially useful for lazy-loaded components that you don't want slowing down pages.

More information about that can be found [here](https://github.com/i18next/i18next-http-backend/tree/master/example/next).

#### Reloading Resources in Development

Because resources are loaded once when the server is started, any changes made to your translation JSON files in development will not be loaded until the server is restarted.

In production this does not tend to be an issue, but in development you may want to see updates to your translation JSON files without having to restart your development server each time. To do this, set the `reloadOnPrerender` config option to `true`.

This option will reload your translations whenever `serverSideTranslations` is called (in `getStaticProps` or `getServerSideProps`). If you are using `serverSideTranslations` in `getServerSideProps`, it is recommended to disable `reloadOnPrerender` in production environments as to avoid reloading resources on each server call.

#### Options

| Key                 | Default value        | Note                                                           |
| ------------------- | -------------------- | -------------------------------------------------------------- |
| `defaultNS`         | `'common'`           |                                                                |
| `localePath`        | `'./public/locales'` | Can be a function, see note below. (can also be null, if passing resources option directly via config, like [here](https://www.i18next.com/how-to/add-or-load-translations#add-on-init))                            |
| `localeExtension`   | `'json'`             | Ignored if `localePath` is a function.                         |
| `localeStructure`   | `'{{lng}}/{{ns}}'`   | Ignored if `localePath` is a function.                         |
| `reloadOnPrerender` | `false`              |                                                                |
| `serializeConfig`   | `true`               |                                                                |
| `use` (for plugins) | `[]`                 |                                                                |
| `onPreInitI18next`  | `undefined`          | i.e. `(i18n) => i18n.on('failedLoading', handleFailedLoading)` |

`localePath` as a function is of the form `(locale: string, namespace: string, missing: boolean) => string` returning the entire path including filename and extension. When `missing` is true, return the path for the `addPath` option of `i18next-fs-backend`, when false, return the path for the `loadPath` option. [More info at the `i18next-fs-backend` repo.](https://github.com/i18next/i18next-fs-backend/tree/master#backend-options)
<br />
If the localePath is a function, make sure you also define the ns option, because on server side we're not able to preload the namespaces then.

All other [i18next options](https://www.i18next.com/overview/configuration-options) and [react-i18next options](https://react.i18next.com/latest/i18next-instance) can be passed in as well.
</br>
You can also pass in the [`resources`](https://www.i18next.com/overview/configuration-options#languages-namespaces-resources) directly in combination with setting `localePath` to `null`.

#### Custom interpolation prefix/suffix

By default, i18next uses `{{` as prefix and `}}` as suffix for [interpolation](https://www.i18next.com/translation-function/interpolation).
If you want/need to override these interpolation settings, you **must** also specify an alternative `localeStructure` setting that matches your custom prefix and suffix.

For example, if you want to use `{` and `}` the config would look like this:

```js
{
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'nl'],
  },
  interpolation: {
    prefix: '{',
    suffix: '}',
  },
  localeStructure: '{lng}/{ns}',
}
```

#### Custom `next-i18next.config.js` path

If you want to change the default config path, you can set the environment variable `I18NEXT_DEFAULT_CONFIG_PATH`.

For example, inside the `.env` file you can set a static path:

```
I18NEXT_DEFAULT_CONFIG_PATH=/path/to/project/apps/my-app/next-i18next.config.js
```

Or you can use a trick for dynamic path and set the following inside `next.config.js`:

```js
process.env.I18NEXT_DEFAULT_CONFIG_PATH = `${__dirname}/next-i18next.config.js`;

// ... Some other imports

const { i18n } = require('./next-i18next.config');

// ... Some other code

module.exports = {
  i18n,
  ...
};
```

This means that the i18n configuration file will be in the same directory as `next.config.js` and it doesn't matter where your current working directory is. This helps for example for `nx` when you have monorepo and start your application from project root but the application is in `apps/{appName}`.

**Notice** If your config `next-i18next.config.js` is not in the same directory as `next.config.js`, you must copy it manually (or by custom script).

#### Adding next-i18next incrementally

If you are planning on incrementally add next-i18next to you project we recommended that you will pass your `next-i18next.config` to `appWithTranslation` to avoid any issues.

i.e

```js
import nextI18nextConfig from '../../next-i18next.config';
//...
export default appWithTranslation(MyApp, nextI18nextConfig);
```

See Issue [#2259](https://github.com/i18next/next-i18next/issues/2259) for more information.

## Notes

### Vercel and Netlify

Some serverless PaaS may not be able to locate the path of your translations and require additional configuration. If you have filesystem issues using `serverSideTranslations`, set `config.localePath` to use `path.resolve`. An example can be [found here](https://github.com/i18next/next-i18next/issues/1552#issuecomment-1538452722).

### Docker

For Docker deployment, note that if you use the `Dockerfile` from [Next.js docs](https://nextjs.org/docs/deployment#docker-image) do not forget to copy `next.config.js` and `next-i18next.config.js` into the Docker image.

```
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/next-i18next.config.js ./next-i18next.config.js
```

### Asynchronous i18next backends

If you choose to use an i18next backend different to the built-in [i18next-fs-backend](https://github.com/i18next/i18next-fs-backend), you will need to ensure the translation resources are loaded before you call the `t` function.
Since [React suspense is not yet supported for SSR](https://github.com/i18next/next-i18next/issues/1255), this can be solved in 2 different ways:

**1) Preload the namespaces:**

Set the `ns` option, like in [this example](https://github.com/locize/next-i18next-locize/blob/main/next-i18next.config.js#L48). Doing this will ensure all translation resources are loaded on initialization.

**2) Check the ready flag:**

If you cannot or do not want to provide the `ns` array, calls to the `t` function will cause namespaces to be loaded on the fly. This means you'll need to handle the "not ready" state by checking `ready === true` or `props.tReady === true`. Not doing so will result in rendering your translations before they loaded, which will cause "save missing" be called despite the translations actually existing (just yet not loaded).
This can be done with the [useTranslation hook](https://react.i18next.com/latest/usetranslation-hook#not-using-suspense) or the [withTranslation HOC](https://react.i18next.com/latest/withtranslation-hoc#not-using-suspense).

### Static HTML Export SSG

Are you trying to generate a [static HTML export](https://nextjs.org/docs/advanced-features/static-html-export) by executing `next export` and are getting this error?

> Error: i18n support is not compatible with next export. See here for more info on deploying: https://nextjs.org/docs/deployment

But there's a way to workaround that with the help of [next-language-detector](https://github.com/i18next/next-language-detector).
Check out [this blog post](https://locize.com/blog/next-i18n-static/) and [this example project](./examples/ssg/).
[![](https://locize.com/blog/next-i18n-static/title.jpg)](https://locize.com/blog/next-i18n-static/)

### Translate in child components

You have multiple ways to use the t function in your child component:

1. Pass the `t` function via props down to the children
2. Pass the translated text via props down to the children, like in this example: https://github.com/i18next/next-i18next/blob/master/examples/simple/components/Header.tsx#L12
3. Use the [`useTranslation`](https://react.i18next.com/latest/usetranslation-hook) function, like in this example: https://github.com/i18next/next-i18next/blob/e6b5085b5e92004afa9516bd444b19b2c8cf5758/examples/simple/components/Footer.tsx#L6
4. Use the [`withTranslation`](https://react.i18next.com/latest/withtranslation-hoc) function

_And in general, you always needs to be sure serverSideTranslations contains all namespaces you need in the tree._

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
      <td align="center" valign="top" width="14.28%"><a href="https://isaachinman.com/"><img src="https://avatars.githubusercontent.com/u/10575782?v=4?s=100" width="100px;" alt="Isaac Hinman"/><br /><sub><b>Isaac Hinman</b></sub></a><br /><a href="#a11y-isaachinman" title="Accessibility">️️️️♿️</a> <a href="#question-isaachinman" title="Answering Questions">💬</a> <a href="#audio-isaachinman" title="Audio">🔊</a> <a href="#blog-isaachinman" title="Blogposts">📝</a> <a href="https://github.com/i18next/next-i18next/issues?q=author%3Aisaachinman" title="Bug reports">🐛</a> <a href="#business-isaachinman" title="Business development">💼</a> <a href="https://github.com/i18next/next-i18next/commits?author=isaachinman" title="Code">💻</a> <a href="#content-isaachinman" title="Content">🖋</a> <a href="#data-isaachinman" title="Data">🔣</a> <a href="#design-isaachinman" title="Design">🎨</a> <a href="https://github.com/i18next/next-i18next/commits?author=isaachinman" title="Documentation">📖</a> <a href="#eventOrganizing-isaachinman" title="Event Organizing">📋</a> <a href="#example-isaachinman" title="Examples">💡</a> <a href="#financial-isaachinman" title="Financial">💵</a> <a href="#fundingFinding-isaachinman" title="Funding Finding">🔍</a> <a href="#ideas-isaachinman" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-isaachinman" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-isaachinman" title="Maintenance">🚧</a> <a href="#mentoring-isaachinman" title="Mentoring">🧑‍🏫</a> <a href="#platform-isaachinman" title="Packaging/porting to new platform">📦</a> <a href="#plugin-isaachinman" title="Plugin/utility libraries">🔌</a> <a href="#projectManagement-isaachinman" title="Project Management">📆</a> <a href="#research-isaachinman" title="Research">🔬</a> <a href="https://github.com/i18next/next-i18next/pulls?q=is%3Apr+reviewed-by%3Aisaachinman" title="Reviewed Pull Requests">👀</a> <a href="#security-isaachinman" title="Security">🛡️</a> <a href="#talk-isaachinman" title="Talks">📢</a> <a href="https://github.com/i18next/next-i18next/commits?author=isaachinman" title="Tests">⚠️</a> <a href="#tool-isaachinman" title="Tools">🔧</a> <a href="#translation-isaachinman" title="Translation">🌍</a> <a href="#tutorial-isaachinman" title="Tutorials">✅</a> <a href="#userTesting-isaachinman" title="User Testing">📓</a> <a href="#video-isaachinman" title="Videos">📹</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://locize.com/"><img src="https://avatars.githubusercontent.com/u/1086194?v=4?s=100" width="100px;" alt="Adriano Raiano"/><br /><sub><b>Adriano Raiano</b></sub></a><br /><a href="#a11y-adrai" title="Accessibility">️️️️♿️</a> <a href="#question-adrai" title="Answering Questions">💬</a> <a href="#audio-adrai" title="Audio">🔊</a> <a href="#blog-adrai" title="Blogposts">📝</a> <a href="https://github.com/i18next/next-i18next/issues?q=author%3Aadrai" title="Bug reports">🐛</a> <a href="#business-adrai" title="Business development">💼</a> <a href="https://github.com/i18next/next-i18next/commits?author=adrai" title="Code">💻</a> <a href="#content-adrai" title="Content">🖋</a> <a href="#data-adrai" title="Data">🔣</a> <a href="#design-adrai" title="Design">🎨</a> <a href="https://github.com/i18next/next-i18next/commits?author=adrai" title="Documentation">📖</a> <a href="#eventOrganizing-adrai" title="Event Organizing">📋</a> <a href="#example-adrai" title="Examples">💡</a> <a href="#financial-adrai" title="Financial">💵</a> <a href="#fundingFinding-adrai" title="Funding Finding">🔍</a> <a href="#ideas-adrai" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-adrai" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-adrai" title="Maintenance">🚧</a> <a href="#mentoring-adrai" title="Mentoring">🧑‍🏫</a> <a href="#platform-adrai" title="Packaging/porting to new platform">📦</a> <a href="#plugin-adrai" title="Plugin/utility libraries">🔌</a> <a href="#projectManagement-adrai" title="Project Management">📆</a> <a href="#research-adrai" title="Research">🔬</a> <a href="https://github.com/i18next/next-i18next/pulls?q=is%3Apr+reviewed-by%3Aadrai" title="Reviewed Pull Requests">👀</a> <a href="#security-adrai" title="Security">🛡️</a> <a href="#talk-adrai" title="Talks">📢</a> <a href="https://github.com/i18next/next-i18next/commits?author=adrai" title="Tests">⚠️</a> <a href="#tool-adrai" title="Tools">🔧</a> <a href="#translation-adrai" title="Translation">🌍</a> <a href="#tutorial-adrai" title="Tutorials">✅</a> <a href="#userTesting-adrai" title="User Testing">📓</a> <a href="#video-adrai" title="Videos">📹</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/felixmosh"><img src="https://avatars.githubusercontent.com/u/9304194?v=4?s=100" width="100px;" alt="Felix Mosheev"/><br /><sub><b>Felix Mosheev</b></sub></a><br /><a href="#question-felixmosh" title="Answering Questions">💬</a> <a href="https://github.com/i18next/next-i18next/commits?author=felixmosh" title="Code">💻</a> <a href="#talk-felixmosh" title="Talks">📢</a> <a href="https://github.com/i18next/next-i18next/commits?author=felixmosh" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://soluble.io/pro"><img src="https://avatars.githubusercontent.com/u/259798?v=4?s=100" width="100px;" alt="Sébastien Vanvelthem"/><br /><sub><b>Sébastien Vanvelthem</b></sub></a><br /><a href="https://github.com/i18next/next-i18next/commits?author=belgattitude" title="Code">💻</a> <a href="https://github.com/i18next/next-i18next/commits?author=belgattitude" title="Documentation">📖</a> <a href="#example-belgattitude" title="Examples">💡</a> <a href="#maintenance-belgattitude" title="Maintenance">🚧</a> <a href="#userTesting-belgattitude" title="User Testing">📓</a></td>
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
  <a href="https://locize.com/" target="_blank">
    <img src="https://raw.githubusercontent.com/i18next/i18next/master/assets/locize_sponsor_240.gif" width="240px">
  </a>
</p>

---

**localization as a service - locize.com**

Needing a translation management? Want to edit your translations with an InContext Editor? Use the original provided to you by the maintainers of i18next!

![locize](https://locize.com/img/ads/github_locize.png)

With using [locize](http://locize.com/?utm_source=next_i18next_readme&utm_medium=github) you directly support the future of i18next and next-i18next.

---
