# next-i18next

[![npm version](https://badge.fury.io/js/next-i18next.svg)](https://badge.fury.io/js/next-i18next)
[![CircleCI](https://circleci.com/gh/isaachinman/next-i18next.svg?style=shield)](https://circleci.com/gh/isaachinman/next-i18next)
[![Package Quality](https://npm.packagequality.com/shield/next-i18next.svg)](https://packagequality.com/#?package=next-i18next)

**The easiest way to translate your NextJs apps.**

If you are using next-i18next in production, please consider [sponsoring the package](https://github.com/sponsors/isaachinman) with any amount you think appropriate.

## What is this?

Although NextJs [provides internationalised routing directly](https://nextjs.org/docs/advanced-features/i18n-routing), it does not handle any management of translation content, or the actual translation functionality itself. All NextJs does is keep your locales and URLs in sync.

To complement this, `next-i18next` provides the remaining functionality – management of translation content, and components/hooks to translate your React components – while fully supporting SSG/SSR, multiple [namespaces](https://www.i18next.com/principles/namespaces), codesplitting, etc.

While `next-i18next` uses [i18next](https://www.i18next.com/) and [react-i18next](https://github.com/i18next/react-i18next) under the hood, users of `next-i18next` simply need to include their translation content as JSON files and don't have to worry about much else.

A live demo is [available here](http://next-i18next.com/). This demo app is the [simple example](./examples/simple/) - nothing more, nothing less.

## Why next-i18next?

Easy to set up, easy to use: setup only takes a few steps, and configuration is simple.

No other requirements: `next-i18next` simplifies internationalisation for your [NextJs](https://nextjs.org/) app without extra dependencies.

Production ready: `next-i18next` supports passing translations and configuration options into pages as props with SSG/SSR support.

## How does it work?

Your `next-i18next.config.js` file will provide configuration for `next-i18next`.
After configuration, `appWithTranslation` allows us to use the `t` (translate) function in our components via hooks.

Then we add `serverSideTranslation` to [getStaticProps](https://nextjs.org/docs/basic-features/data-fetching#getstaticprops-static-generation) or [getServerSideProps](https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering) (depending on your case) in our page-level components.

Now our NextJs app is fully translatable!

## Setup

### 1. Installation

```jsx
yarn add next-i18next
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

First, create a `next-i18next.config.js` file in the root of your project. The syntax for the nested `i18n` object [comes from NextJs directly](https://nextjs.org/docs/advanced-features/i18n-routing).

This tells `next-i18next` what your `defaultLocale` and other locales are, so that it can preload translations on the server:

#### `next-i18next.config.js`

```js
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
  },
};
```

Now, create or modify your `next.config.js` file, by passing the `i18n` object into your `next.config.js` file, to enable localised URL routing:

#### [`next.config.js`](https://nextjs.org/docs/api-reference/next.config.js/introduction)

```js
const { i18n } = require('./next-i18next.config');

module.exports = {
  i18n,
};
```

There are three functions that `next-i18next` exports, which you will need to use to translate your project:

#### appWithTranslation

This is a HOC which wraps your [`_app`](https://nextjs.org/docs/advanced-features/custom-app):

```tsx
import { appWithTranslation } from 'next-i18next';

const MyApp = ({ Component, pageProps }) => <Component {...pageProps} />;

export default appWithTranslation(MyApp);
```

The `appWithTranslation` HOC is primarily responsible for adding a [`I18nextProvider`](https://react.i18next.com/latest/i18nextprovider).

#### serverSideTranslations

This is an async function that you need to include on your page-level components, via either [`getStaticProps`](https://nextjs.org/docs/basic-features/data-fetching#getstaticprops-static-generation) or [`getServerSideProps`](https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering) (depending on your use case):

```tsx
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'footer'])),
      // Will be passed to the page component as props
    },
  };
}
```

Note that `serverSideTranslations` must be imported from `next-i18next/serverSideTranslations` – this is a separate module that contains NodeJs-specific code.

Also, note that `serverSideTranslations` is not compatible with `getInitialProps`, as it _only_ can execute in a server environment, whereas `getInitialProps` is called on the client side when navigating between pages.

The `serverSideTranslations` HOC is primarily responsible for passing translations and configuration options into pages, as props – you need to add it to any page that has translations.

### useTranslation

This is the hook which you'll actually use to do the translation itself. The `useTranslation` hook [comes from `react-i18next`](https://react.i18next.com/latest/usetranslation-hook), but can be imported from `next-i18next` directly:

```tsx
import { useTranslation } from 'next-i18next';

export const Footer = () => {
  const { t } = useTranslation('footer');

  return (
    <footer>
      <p>{t('description')}</p>
    </footer>
  );
};
```

### 4. Declaring namespace dependencies

By default, `next-i18next` will send _all your namespaces_ down to the client on each initial request. This can be an appropriate approach for smaller apps with less content, but a lot of apps will benefit from splitting namespaces based on route.

To do that, you can pass an array of required namespaces for each page into `serverSideTranslations`. You can see this approach in [examples/simple/pages/index.js](./examples/simple/pages/index.js). Passing in an empty array of required namespaces will send no namespaces. 

Note: `useTranslation` provides namespaces to the component that you use it in. However, `serverSideTranslations` provides the total available namespaces to the entire React tree and belongs on the page level. Both are required.

### 5. Advanced configuration

#### Passing other config options

If you need to modify more advanced configuration options, you can pass them via `next-i18next.config.js`. For example:

```js
const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
  },
  localePath: path.resolve('./my/custom/path'),
};
```

#### Unserialisable configs

Some `i18next` plugins (which you can pass into `config.use`) are unserialisable, as they contain functions and other JavaScript primitives.

You may run into this if your use case is more advanced. You'll see NextJs throw an error like:

```
Error: Error serializing `._nextI18Next.userConfig.use[0].process` returned from `getStaticProps` in "/my-page".
Reason: `function` cannot be serialized as JSON. Please only return JSON serializable data types.
```

To fix this, you'll need to set `config.serializeConfig` to `false`, and manually pass your config into `appWithTranslation`:

```tsx
import { appWithTranslation } from 'next-i18next';
import nextI18NextConfig from '../next-i18next.config.js';

const MyApp = ({ Component, pageProps }) => <Component {...pageProps} />;

export default appWithTranslation(MyApp, nextI18NextConfig);
```

```tsx
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import nextI18NextConfig from '../next-i18next.config.js';

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(
      locale,
      ['common', 'footer'],
      nextI18NextConfig
    )),
  },
});
```

#### Reloading Resources in Development

Because resources are loaded once when the server is started, any changes made to your translation JSON files in development will not be loaded until the server is restarted.

In production this does not tend to be an issue, but in development you may want to see updates to your translation JSON files without having to restart your development server each time. To do this, set the `reloadOnPrerender` config option to `true`.

This option will reload your translations whenever `serverSideTranslations` is called (in `getStaticProps` or `getServerSideProps`). If you are using `serverSideTranslations` in `getServerSideProps`, it is recommended to disable `reloadOnPrerender` in production environments as to avoid reloading resources on each server call.

#### Options

| Key                 | Default value        |
| ------------------- | -------------------- |
| `defaultNS`         | `'common'`           |
| `localeExtension`   | `'json'`             |
| `localePath`        | `'./public/locales'` |
| `localeStructure`   | `'{{lng}}/{{ns}}'`   |
| `reloadOnPrerender` | `false`              |
| `serializeConfig`   | `true`               |
| `strictMode`        | `true`               |
| `use` (for plugins) | `[]`                 |

All other [i18next options](https://www.i18next.com/overview/configuration-options) can be passed in as well.

#### Loading Namespaces Dynamically Client Side

In some use cases, you might want to load a translation file dynamically without having to use `serverSideTranslations`. This can be especially useful for lazy-loaded components that you don't want slowing down pages.

This can easily be done by using [addResourceBundle](https://www.i18next.com/how-to/add-or-load-translations#add-after-init):

```tsx
import { i18n } from 'next-i18next'

const Component = () => {
  const { locale } = useRouter()

  useEffect(() => {
    i18n.addResourceBundle(locale, '<namespace name>')
  }, [])
}
```

## Migration to v8

To migrate from previous versions to the version 8, check out the [v8-migration guide](https://github.com/isaachinman/next-i18next/tree/master/docs/v8-migration.md)

## Notes

For Docker deployment, note that if you use the `Dockerfile` from [Next.js docs](https://nextjs.org/docs/deployment#docker-image) do not forget to copy `next.config.js` and `next-i18next.config.js` into the Docker image.

```
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/next-i18next.config.js ./next-i18next.config.js
```

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table cellspacing="0" cellpadding="1"><tr><td><a href="https://github.com/capellini"><img src="https://avatars3.githubusercontent.com/u/75311?v=4" width="100px;" height="100px;" alt="Rob Capellini"/><br /><sub><b>Rob Capellini</b></sub></a><br /><a href="https://github.com/isaachinman/next-i18next/commits?author=capellini" title="Code">💻</a> <a href="https://github.com/isaachinman/next-i18next/commits?author=capellini" title="Tests">⚠️</a></td><td><a href="https://en.kachkaev.ru"><img src="https://avatars3.githubusercontent.com/u/608862?v=4" width="100px;" height="100px;" alt="Alexander Kachkaev"/><br /><sub><b>Alexander Kachkaev</b></sub></a><br /><a href="#talk-kachkaev" title="Talks">📢</a> <a href="#question-kachkaev" title="Answering Questions">💬</a> <a href="#ideas-kachkaev" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/isaachinman/next-i18next/commits?author=kachkaev" title="Code">💻</a> <a href="https://github.com/isaachinman/next-i18next/commits?author=kachkaev" title="Tests">⚠️</a></td><td><a href="https://kandelborg.dk"><img src="https://avatars1.githubusercontent.com/u/33042011?v=4" width="100px;" height="100px;" alt="Mathias Wøbbe"/><br /><sub><b>Mathias Wøbbe</b></sub></a><br /><a href="https://github.com/isaachinman/next-i18next/commits?author=MathiasKandelborg" title="Code">💻</a> <a href="#ideas-MathiasKandelborg" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/isaachinman/next-i18next/commits?author=MathiasKandelborg" title="Tests">⚠️</a></td><td><a href="http://lucasfeliciano.com"><img src="https://avatars3.githubusercontent.com/u/968014?v=4" width="100px;" height="100px;" alt="Lucas Feliciano"/><br /><sub><b>Lucas Feliciano</b></sub></a><br /><a href="#ideas-lucasfeliciano" title="Ideas, Planning, & Feedback">🤔</a> <a href="#review-lucasfeliciano" title="Reviewed Pull Requests">👀</a></td><td><a href="http://www.fifteenprospects.com"><img src="https://avatars2.githubusercontent.com/u/6932550?v=4" width="100px;" height="100px;" alt="Ryan Leung"/><br /><sub><b>Ryan Leung</b></sub></a><br /><a href="https://github.com/isaachinman/next-i18next/commits?author=minocys" title="Code">💻</a></td><td><a href="http://nathanfriemel.com"><img src="https://avatars3.githubusercontent.com/u/1325835?v=4" width="100px;" height="100px;" alt="Nathan Friemel"/><br /><sub><b>Nathan Friemel</b></sub></a><br /><a href="https://github.com/isaachinman/next-i18next/commits?author=nathanfriemel" title="Code">💻</a> <a href="https://github.com/isaachinman/next-i18next/commits?author=nathanfriemel" title="Documentation">📖</a> <a href="#example-nathanfriemel" title="Examples">💡</a> <a href="#ideas-nathanfriemel" title="Ideas, Planning, & Feedback">🤔</a></td></tr></table>
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!

## Sponsors

<a href="https://locize.com/" target="_blank">
  <img src="https://raw.githubusercontent.com/i18next/i18next/master/assets/locize_sponsor_240.gif" width="240px">
</a>

<a href="https://www.browserstack.com/" target="_blank">
  <img src="https://miro.medium.com/max/560/0*dLdslKvNsmtaH2uQ.png" width="240px">
</a>
