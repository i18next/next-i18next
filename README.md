# next-i18next
[![npm version](https://badge.fury.io/js/next-i18next.svg)](https://badge.fury.io/js/next-i18next)
[![CircleCI](https://circleci.com/gh/isaachinman/next-i18next.svg?style=shield)](https://circleci.com/gh/isaachinman/next-i18next)
[![dependencies Status](https://david-dm.org/isaachinman/next-i18next/status.svg)](https://david-dm.org/isaachinman/next-i18next)
[![Package Quality](https://npm.packagequality.com/shield/next-i18next.svg)](https://packagequality.com/#?package=next-i18next) [![Greenkeeper badge](https://badges.greenkeeper.io/isaachinman/next-i18next.svg)](https://greenkeeper.io/)

**The easiest way to translate your NextJs apps.**

## What is this?

`next-i18next` is a plugin for [Next.js](https://nextjs.org/) projects that allows you to get translations up and running quickly and easily, while fully supporting SSR, multiple [namespaces](https://www.i18next.com/principles/namespaces) with codesplitting, etc.

While `next-i18next` uses [i18next](https://www.i18next.com/) and [react-i18next](https://github.com/i18next/react-i18next) under the hood, users of `next-i18next` simply need to include their translation content as JSON files and don't have to worry about much else.

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
└── static
    └── locales
        ├── en
        |   └── common.json
        └── de
            └── common.json
```

This structure can also be seen in the [simple example](./examples/simple).

If you want to structure your translations/namespaces in a custom way, you will need to pass modified `localePath` and `localeStructure` values into the initialisation config.

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
  withNamespaces,
} = NextI18NextInstance
```

[A full list of options can be seen here](#options).

It's recommended to export this `NextI18Next` instance from a single file in your project, where you can continually import it from to use the class methods as needed. You can see this approach in the [examples/simple/i18n.js](./examples/simple/i18n.js) file.

After creating and exporting your `NextI18Next` instance, you need to take the following steps to get things working:

1. Create an `_app.js` file inside your `pages` directory, and wrap it with the `NextI18Next.appWithTranslation` higher order component (HOC). You can see this approach in the [examples/simple/pages/_app.js](./examples/simple/pages/_app.js). 
2. Create a `server.js` file inside your root directory, initialise an [express](https://www.npmjs.com/package/express) server, and use the `nextI18NextMiddleware` middleware with your `nextI18Next` instance passed in. You can see this approach in the [examples/simple/server.js](./examples/simple/server.js). For more info, see [the NextJs section on custom servers](https://github.com/zeit/next.js#custom-server-and-routing).

That's it! Your app is ready to go. You can now use the `NextI18Next.withNamespaces` HOC to make your components or pages translatable, based on namespaces:

```jsx
import React from 'react'

// This is our initialised `NextI18Next` instance
import { withNamespaces } from '../i18n'

class Footer extends React.Component {
  render() {
    return (
      <footer>{this.props.t('description')}</footer>
    )
  }
}

export default withNamespaces('footer')(Footer)
```

### 4. Declaring namespace dependencies

The `withNamespaces` HOC is responsible for passing the `t` function to your component. It enables all the translation functionality provided by `i18next`. Further, it asserts your component gets re-rendered on language change or changes to the translation catalog itself (loaded translations). More info can be found [here](https://react.i18next.com/legacy-v9/withnamespaces).

By default, `next-i18next` will send _all your namespaces_ down to the client on each initial request. This can be an appropriate approach for smaller apps with less content, but a lot of apps will benefit from splitting namespaces based on route.

To do that, you need to return a `namespacesRequired` array via `getInitialProps` on your page-level component. You can see this approach in [examples/simple/pages/index.js](./examples/simple/pages/index.js).

Note: `withNamespaces` provides namespaces to the component that it wraps. However, `namespacesRequired` provides the total available namespaces to the entire React tree and belongs on the page level. Both are required (although you can use `Trans` instead of `withNamespaces` if desired).

### 5. Locale subpaths

One of the main features of this package, besides translation itself, are locale subpaths. It's easiest to explain by example:

```
myapp.com         ---> Homepage in default lang
myapp.com/de/     ---> Homepage in German
```

This functionality is not enabled by default, and must be passed as an option into the `NextI18Next` constructor:

```jsx
new NextI18Next({ localeSubpaths: 'foreign' })
```

Now, all your page routes will be duplicated across all your non-default language subpaths. If our `static/locales` folder included `fr`, `de`, and `es` translation directories, we will automatically get:

```
myapp.com
myapp.com/fr/
myapp.com/de/
myapp.com/es/
```

If you also want to enable locale subpaths for the default locale, set `localeSubpaths` to `all`:
```jsx
new NextI18Next({ localeSubpaths: 'all' })
```

We'll now get:
```
myapp.com/en/
myapp.com/fr/
myapp.com/de/
myapp.com/es/
```

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

We can also navigate imperatively with locale subpaths by importing `Router` from your `NextI18Next` instance.
The exported Router shares the same API as the native Next Router. The push, replace, and prefetch functions will automatically prepend locale subpaths.

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

## Options

| Key  | Default value |
| ------------- | ------------- |
| `browserLanguageDetection`  | `true`  |
| `defaultNS` | `'common'`  |
| `defaultLanguage`  | `'en'`  |
| `ignoreRoutes`  | `['/_next', '/static']`  |
| `otherLanguages` (required) | `[]`  |
| `localePath` | `'static/locales'`  |
| `localeStructure` | `'{{lng}}/{{ns}}'`  |
| `localeSubpaths` | `'none'`  |
| `serverLanguageDetection` | `true`  |
| `use` (for plugins) | `[]`  |
| `customDetectors` | `[]`  |

_This table contains options which are specific to next-i18next. All other [i18next options](https://www.i18next.com/overview/configuration-options) can be passed in as well._

## Notes

- [`next export` will result in a _client-side only_ React application.](https://github.com/isaachinman/next-i18next/issues/10)
- [We cannot support koa until a 1:1 replacement for `i18next-express-middleware` exists](https://github.com/isaachinman/next-i18next/issues/9).
- [To add a `lang` attribute to your top-level html DOM node, you must create a `_document.js` file.](https://github.com/isaachinman/next-i18next/issues/20#issuecomment-443461652)

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table cellspacing="0" cellpadding="1"><tr><td><a href="https://github.com/capellini"><img src="https://avatars3.githubusercontent.com/u/75311?v=4" width="100px;" height="100px;" alt="Rob Capellini"/><br /><sub><b>Rob Capellini</b></sub></a><br /><a href="https://github.com/isaachinman/next-i18next/commits?author=capellini" title="Code">💻</a> <a href="https://github.com/isaachinman/next-i18next/commits?author=capellini" title="Tests">⚠️</a></td><td><a href="https://en.kachkaev.ru"><img src="https://avatars3.githubusercontent.com/u/608862?v=4" width="100px;" height="100px;" alt="Alexander Kachkaev"/><br /><sub><b>Alexander Kachkaev</b></sub></a><br /><a href="#talk-kachkaev" title="Talks">📢</a> <a href="#question-kachkaev" title="Answering Questions">💬</a> <a href="#ideas-kachkaev" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/isaachinman/next-i18next/commits?author=kachkaev" title="Code">💻</a> <a href="https://github.com/isaachinman/next-i18next/commits?author=kachkaev" title="Tests">⚠️</a></td><td><a href="https://kandelborg.dk"><img src="https://avatars1.githubusercontent.com/u/33042011?v=4" width="100px;" height="100px;" alt="Mathias Wøbbe"/><br /><sub><b>Mathias Wøbbe</b></sub></a><br /><a href="https://github.com/isaachinman/next-i18next/commits?author=MathiasKandelborg" title="Code">💻</a> <a href="#ideas-MathiasKandelborg" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/isaachinman/next-i18next/commits?author=MathiasKandelborg" title="Tests">⚠️</a></td><td><a href="http://lucasfeliciano.com"><img src="https://avatars3.githubusercontent.com/u/968014?v=4" width="100px;" height="100px;" alt="Lucas Feliciano"/><br /><sub><b>Lucas Feliciano</b></sub></a><br /><a href="#ideas-lucasfeliciano" title="Ideas, Planning, & Feedback">🤔</a> <a href="#review-lucasfeliciano" title="Reviewed Pull Requests">👀</a></td><td><a href="http://www.fifteenprospects.com"><img src="https://avatars2.githubusercontent.com/u/6932550?v=4" width="100px;" height="100px;" alt="Ryan Leung"/><br /><sub><b>Ryan Leung</b></sub></a><br /><a href="https://github.com/isaachinman/next-i18next/commits?author=minocys" title="Code">💻</a></td></tr></table>
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!
