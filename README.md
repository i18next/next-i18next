# next-i18next
[![npm version](https://badge.fury.io/js/next-i18next.svg)](https://badge.fury.io/js/next-i18next)
[![CircleCI](https://circleci.com/gh/isaachinman/next-i18next.svg?style=shield)](https://circleci.com/gh/isaachinman/next-i18next)
[![dependencies Status](https://david-dm.org/isaachinman/next-i18next/status.svg)](https://david-dm.org/isaachinman/next-i18next)
[![Package Quality](https://npm.packagequality.com/shield/next-i18next.svg)](https://packagequality.com/#?package=next-i18next)

**The easiest way to translate your NextJs apps.**

If you are using next-i18next in production, please consider [sponsoring the package](https://github.com/sponsors/isaachinman) with any amount you think appropriate.

## What is this?

`next-i18next` is a plugin for [Next.js](https://nextjs.org/) projects that allows you to get translations up and running quickly and easily, while fully supporting SSR, multiple [namespaces](https://www.i18next.com/principles/namespaces) with codesplitting, etc.

While `next-i18next` uses [i18next](https://www.i18next.com/) and [react-i18next](https://github.com/i18next/react-i18next) under the hood, users of `next-i18next` simply need to include their translation content as JSON files and don't have to worry about much else.

A live demo is [available here](http://next-i18next.com/). Please be aware this is hosted on a free Heroku dyno and therefore may go to sleep during periods of inactivity. This demo app is the [simple example](./examples/simple/) - nothing more, nothing less.

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
    └── static
        └── locales
            ├── en
            |   └── common.json
            └── de
                └── common.json
```

This structure can also be seen in the [simple example](./examples/simple).

If you want to structure your translations/namespaces in a custom way, you will need to pass modified `localePath` and `localeStructure` values into the initialisation config.

If translations are not found in `config.localePath` or `public/static/locales` an attempt will be made to find the locales in `static/locales`, if found a deprecation warning will be logged.

### 3. Project setup

The default export of `next-i18next` is a class constructor, into which you pass your config options. The resulting class has all the methods you will need to translate your app:

```jsx
import NextI18Next from 'next-i18next'

const NextI18NextInstance = new NextI18Next({
  defaultLanguage: 'en',
  otherLanguages: ['de']
})

export default NextI18NextInstance

/* Optionally, export class methods as named exports */
export const {
  appWithTranslation,
  withTranslation,
} = NextI18NextInstance
```

[A full list of options can be seen here](#options).

It's recommended to export this `NextI18Next` instance from a single file in your project, where you can continually import it from to use the class methods as needed. You can see this approach in the [examples/simple/i18n.js](./examples/simple/i18n.js) file.

After creating and exporting your `NextI18Next` instance, you need to take the following steps to get things working:

1. Create an `_app.js` file inside your `pages` directory, and wrap it with the `NextI18Next.appWithTranslation` higher order component (HOC). You can see this approach in the [examples/simple/pages/_app.js](./examples/simple/pages/_app.js).
Your app component must either extend `App` if it's a class component or define a `getInitialProps` if it's a functional component [(explanation here)](https://github.com/isaachinman/next-i18next/issues/615#issuecomment-575578375).
2. Create a `next.config.js` file inside your root directory if you want to use locale subpaths. You can see this approach in the [examples/simple/next.config.js](./examples/simple/next.config.js).

Note: You can pass `shallowRender: true` into config options to avoid triggering getInitialProps when `changeLanguage` method is invoked.

That's it! Your app is ready to go. You can now use the `NextI18Next.withTranslation` HOC to make your components or pages translatable, based on namespaces:

```jsx
import React from 'react'

// This is our initialised `NextI18Next` instance
import { withTranslation } from '../i18n'

class Footer extends React.Component {
  render() {
    return (
      <footer>{this.props.t('description')}</footer>
    )
  }
}

export default withTranslation('footer')(Footer)
```

### 4. Declaring namespace dependencies

The `withTranslation` HOC is responsible for passing the `t` function to your component. It enables all the translation functionality provided by `i18next`. Further, it asserts your component gets re-rendered on language change or changes to the translation catalog itself (loaded translations). More info can be found [here](https://react.i18next.com/latest/withtranslation-hoc).

By default, `next-i18next` will send _all your namespaces_ down to the client on each initial request. This can be an appropriate approach for smaller apps with less content, but a lot of apps will benefit from splitting namespaces based on route.

To do that, you need to return a `namespacesRequired` array via `getInitialProps` on your page-level component. You can see this approach in [examples/simple/pages/index.js](./examples/simple/pages/index.js).

Note: `withTranslation` provides namespaces to the component that it wraps. However, `namespacesRequired` provides the total available namespaces to the entire React tree and belongs on the page level. Both are required (although you can use `Trans` instead of `withTranslation` if desired).

### 5. Locale subpaths

One of the main features of this package, besides translation itself, are locale subpaths. It's easiest to explain by example:

```
myapp.com         ---> Homepage in default lang
myapp.com/de     ---> Homepage in German
```

This functionality is not enabled by default, and must be passed as an option into the `NextI18Next` constructor as a config option:

```jsx
new NextI18Next({
  localeSubpaths: {
    de: 'de'
  }
})
```

The `localeSubpaths` object must also be passed into `next.config.js`, via the `nextI18NextRewrites` util, which you can import from `next-i18next/rewrites`.

The `localeSubpaths` option is a key/value mapping, where keys are the locale itself (case sensitive) and values are the subpath without slashes.

Now, all your page routes will be duplicated across all your locale subpaths. Here's an example:

```jsx
----- Config -----
new NextI18Next({
  localeSubpaths: {
    fr: 'fr',
    de: 'german',
    en: 'eng',
  }
})

----- Output -----
myapp.com/fr
myapp.com/german
myapp.com/eng
```

When using the localeSubpaths option, our middleware will redirect as needed in the wrapped `getInitialProps` one level above your `_app`, so none of your code will be called.

The main "gotcha" with locale subpaths is routing. We want to be able to route to "naked" routes, and not have to worry about the locale subpath part of the route:

```jsx
<Link href='/some-page'>
```

With this link, we would expect someone whose language is set to French to automatically be directed to `/fr/some-page`.

To do that, we must import `Link` from your `NextI18Next` instance, **not next/router**:

```jsx
import React from 'react'

// This is our initialised `NextI18Next` instance
import { Link } from '../i18n'

const SomeLink = () => (
  <Link href='/some-page'>
    This will magically prepend locale subpaths
  </Link>
)
```

We can also navigate imperatively with locale subpaths by importing `Router` from your `NextI18Next` instance. The exported Router shares the same API as the native Next Router. The push, replace, and prefetch functions will automatically prepend locale subpaths.

```jsx
import React from 'react'

// This is our initialised `NextI18Next` instance
import { Router } from '../i18n'

const SomeButton = () => (
  <button
    onClick={() => Router.push('/some-page')}
  >
    This will magically prepend locale subpaths
  </button>
)
```

## Custom Routing

Custom routing can be achieved via the `app.render` method:

```jsx
/* First, use middleware */
server.use(nextI18NextMiddleware(nextI18next))

/* Second, declare custom routes */
server.get('/products/:id', (req, res) => {
  const { query, params } = req

  return app.render(req, res, '/product-page', { ...query, id: params.id })
})

/* Third, add catch-all GET for non-custom routes */
server.get('*', (req, res) => handle(req, res))
```

## Accessing the Current Language

In many cases, you'll need to know the currently active language. Most of the time, to accomplish this, you should use the `withTranslation` HOC, which will pass an `i18n` prop to the wrapped component and further asserts your component will get re-rendered on language change or changes to the translation catalog itself (loaded translations). More info can be found [here](https://react.i18next.com/latest/withtranslation-hoc).

If for some reason you need to access the current language inside `getInitialProps`, you'll need to switch over server and client contexts. For example:

```jsx
// This is our initialised `NextI18Next` instance
import { i18n } from '../i18n'

MyPage.getInitialProps = async({ req }) => {
  const currentLanguage = req ? req.language : i18n.language
}
```

## Options

| Key  | Default value |
| ------------- | ------------- |
| `browserLanguageDetection`  | `true`  |
| `defaultNS` | `'common'`  |
| `defaultLanguage`  | `'en'`  |
| `ignoreRoutes`  | `['/_next/', '/static/', '/public/', '/api/']`  |
| `otherLanguages` (required) | `[]`  |
| `localeExtension` | `'json'`  |
| `localePath` | `'public/static/locales'`  |
| `localeStructure` | `'{{lng}}/{{ns}}'`  |
| `localeSubpaths` | `{}`  |
| `serverLanguageDetection` | `true`  |
| `strictMode` | `true`  |
| `use` (for plugins) | `[]`  |
| `customDetectors` | `[]`  |
| `shallowRender` | `false`  |

_This table contains options which are specific to next-i18next. All other [i18next options](https://www.i18next.com/overview/configuration-options) can be passed in as well._

## Notes

- [`next export` will result in a _client-side only_ React application.](https://github.com/isaachinman/next-i18next/issues/10)
- [To add a `lang` attribute to your top-level html DOM node, you must create a `_document.js` file.](https://github.com/isaachinman/next-i18next/issues/20#issuecomment-443461652)
- [Localising `next/head` requires special consideration due to NextJs internals](https://github.com/isaachinman/next-i18next/issues/251#issuecomment-479421852).

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table cellspacing="0" cellpadding="1"><tr><td><a href="https://github.com/capellini"><img src="https://avatars3.githubusercontent.com/u/75311?v=4" width="100px;" height="100px;" alt="Rob Capellini"/><br /><sub><b>Rob Capellini</b></sub></a><br /><a href="https://github.com/isaachinman/next-i18next/commits?author=capellini" title="Code">💻</a> <a href="https://github.com/isaachinman/next-i18next/commits?author=capellini" title="Tests">⚠️</a></td><td><a href="https://en.kachkaev.ru"><img src="https://avatars3.githubusercontent.com/u/608862?v=4" width="100px;" height="100px;" alt="Alexander Kachkaev"/><br /><sub><b>Alexander Kachkaev</b></sub></a><br /><a href="#talk-kachkaev" title="Talks">📢</a> <a href="#question-kachkaev" title="Answering Questions">💬</a> <a href="#ideas-kachkaev" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/isaachinman/next-i18next/commits?author=kachkaev" title="Code">💻</a> <a href="https://github.com/isaachinman/next-i18next/commits?author=kachkaev" title="Tests">⚠️</a></td><td><a href="https://kandelborg.dk"><img src="https://avatars1.githubusercontent.com/u/33042011?v=4" width="100px;" height="100px;" alt="Mathias Wøbbe"/><br /><sub><b>Mathias Wøbbe</b></sub></a><br /><a href="https://github.com/isaachinman/next-i18next/commits?author=MathiasKandelborg" title="Code">💻</a> <a href="#ideas-MathiasKandelborg" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/isaachinman/next-i18next/commits?author=MathiasKandelborg" title="Tests">⚠️</a></td><td><a href="http://lucasfeliciano.com"><img src="https://avatars3.githubusercontent.com/u/968014?v=4" width="100px;" height="100px;" alt="Lucas Feliciano"/><br /><sub><b>Lucas Feliciano</b></sub></a><br /><a href="#ideas-lucasfeliciano" title="Ideas, Planning, & Feedback">🤔</a> <a href="#review-lucasfeliciano" title="Reviewed Pull Requests">👀</a></td><td><a href="http://www.fifteenprospects.com"><img src="https://avatars2.githubusercontent.com/u/6932550?v=4" width="100px;" height="100px;" alt="Ryan Leung"/><br /><sub><b>Ryan Leung</b></sub></a><br /><a href="https://github.com/isaachinman/next-i18next/commits?author=minocys" title="Code">💻</a></td><td><a href="http://nathanfriemel.com"><img src="https://avatars3.githubusercontent.com/u/1325835?v=4" width="100px;" height="100px;" alt="Nathan Friemel"/><br /><sub><b>Nathan Friemel</b></sub></a><br /><a href="https://github.com/isaachinman/next-i18next/commits?author=nathanfriemel" title="Code">💻</a> <a href="https://github.com/isaachinman/next-i18next/commits?author=nathanfriemel" title="Documentation">📖</a> <a href="#example-nathanfriemel" title="Examples">💡</a> <a href="#ideas-nathanfriemel" title="Ideas, Planning, & Feedback">🤔</a></td></tr></table>
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!

## Supported by BrowserStack
Thanks to [BrowserStack](https://browserstack.com/) for their support of this open-source project.

<img src="https://3fxtqy18kygf3on3bu39kh93-wpengine.netdna-ssl.com/wp-content/themes/browserstack/img/browserstack-logo.svg" width="150">
