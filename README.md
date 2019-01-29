# next-i18next
[![npm version](https://badge.fury.io/js/next-i18next.svg)](https://badge.fury.io/js/next-i18next)
[![CircleCI](https://circleci.com/gh/isaachinman/next-i18next.svg?style=shield)](https://circleci.com/gh/isaachinman/next-i18next)
[![dependencies Status](https://david-dm.org/isaachinman/next-i18next/status.svg)](https://david-dm.org/isaachinman/next-i18next)
[![Package Quality](https://npm.packagequality.com/shield/next-i18next.svg)](https://packagequality.com/#?package=next-i18next) [![Greenkeeper badge](https://badges.greenkeeper.io/isaachinman/next-i18next.svg)](https://greenkeeper.io/)

**The easiest way to translate your NextJs apps.**

## What is this?

`next-i18next` is a plugin for [Next.js](https://nextjs.org/) projects that allows you to get translations up and running quickly and easily, while fully supporting SSR, multiple namespaces with codesplitting, etc.

While `next-i18next` uses [i18next](https://www.i18next.com/) and [react-i18next](https://github.com/i18next/react-i18next) under the hood, users of `next-i18next` simply need to include their translation content as JSON files and don't have to worry about much else.

## Setup

### 1. Installation

```jsx
yarn add next-i18next
```

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

const options = {}
export default new NextI18Next(options)
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
new NextI18Next({ localeSubpaths: true })
```

Now, all your page routes will be duplicated across all your non-default language subpaths. If our `static/locales` folder included `fr`, `de`, and `es` translation directories, we will automatically get:

```
myapp.com
myapp.com/fr/
myapp.com/de/
myapp.com/es/
```

The main "gotcha" with locale subpaths is routing. We want to be able to route to "naked" routes, and not have to worry about the locale subpath part of the route:

```jsx
<Link href='/some-page'>
```

With this link, we would expect someone whose language is set to French to automatically be directed to `/fr/some-page`.

To do that, we must import `Link` from your `NextI18Next`, **not next/router**:

```jsx
import React from 'react'

// This is our initialised `NextI18Next` instance
import { Link } from '../i18n'

class SomeLink extends React.Component {
  render() {
    return (
      <Link href='/some-page'>
        This will magically prepend locale subpaths
      </Link>
    )
  }
}
```

## Custom Routing

Custom routing can be achieved via the `app.render` method:

```jsx
server.use(nextI18NextMiddleware(nextI18next))

server.get('/products/:id', (req, res) => {
  const { query, params } = req
  return app.render(req, res, '/product-page', { ...query, id: params.id })
})
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
| `localeSubpaths` | `false`  |
| `serverLanguageDetection` | `true`  |
| `use` (for plugins) | `[]`  |
| `customDetectors` | `[]`  |

_This table contains options which are specific to next-i18next. All other [i18next options](https://www.i18next.com/overview/configuration-options) can be passed in as well._

## Notes

- [`next export` will result in a _clientside only_ React application.](https://github.com/isaachinman/next-i18next/issues/10)
- [We cannot support koa until a 1:1 replacement for `i18next-express-middleware` exists](https://github.com/isaachinman/next-i18next/issues/9).
- [To add a `lang` attribute to your top-level html DOM node, you must create a `_document.js` file.](https://github.com/isaachinman/next-i18next/issues/20#issuecomment-443461652)

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars3.githubusercontent.com/u/75311?v=4" width="100px;"/><br /><sub><b>Rob Capellini</b></sub>](https://github.com/capellini)<br />[💻](https://github.com/isaachinman/next-i18next/commits?author=capellini "Code") [⚠️](https://github.com/isaachinman/next-i18next/commits?author=capellini "Tests") | [<img src="https://avatars3.githubusercontent.com/u/608862?v=4" width="100px;"/><br /><sub><b>Alexander Kachkaev</b></sub>](https://en.kachkaev.ru)<br />[📢](#talk-kachkaev "Talks") [💬](#question-kachkaev "Answering Questions") [🤔](#ideas-kachkaev "Ideas, Planning, & Feedback") [💻](https://github.com/isaachinman/next-i18next/commits?author=kachkaev "Code") [⚠️](https://github.com/isaachinman/next-i18next/commits?author=kachkaev "Tests") | [<img src="https://avatars1.githubusercontent.com/u/33042011?v=4" width="100px;"/><br /><sub><b>Mathias Wøbbe</b></sub>](https://kandelborg.dk)<br />[💻](https://github.com/isaachinman/next-i18next/commits?author=MathiasKandelborg "Code") [🤔](#ideas-MathiasKandelborg "Ideas, Planning, & Feedback") [⚠️](https://github.com/isaachinman/next-i18next/commits?author=MathiasKandelborg "Tests") | [<img src="https://avatars3.githubusercontent.com/u/968014?v=4" width="100px;"/><br /><sub><b>Lucas Feliciano</b></sub>](http://lucasfeliciano.com)<br />[🤔](#ideas-lucasfeliciano "Ideas, Planning, & Feedback") [👀](#review-lucasfeliciano "Reviewed Pull Requests") |
| :---: | :---: | :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!