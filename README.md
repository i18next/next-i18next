# next-i18next

[![npm version](https://badge.fury.io/js/next-i18next.svg)](https://badge.fury.io/js/next-i18next)
[![CircleCI](https://circleci.com/gh/isaachinman/next-i18next.svg?style=shield)](https://circleci.com/gh/isaachinman/next-i18next)
[![dependencies Status](https://david-dm.org/isaachinman/next-i18next/status.svg)](https://david-dm.org/isaachinman/next-i18next)
[![Package Quality](https://npm.packagequality.com/shield/next-i18next.svg)](https://packagequality.com/#?package=next-i18next)

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
├── static
    ├── en
    |   └── common.json
    └── de
        └── common.json
```

This structure can also be seen in the [example directory](./example).

If you want to structure your translations/namespaces in a custom way, you will need to pass modified `localePath` and `localeStructure` values into the initialisation config.

### 3. Project setup

The default export of `next-i18next` is a class constructor, into which you pass your config options. The resulting class has all the methods you will need to translate your app:

```jsx
import NextI18Next from 'next-i18next'

const options = {}
export default new NextI18Next(options)
```

[A full list of options can be seen here](#options).

It's recommended to export this `NextI18Next` instance from a single file in your project, where you can continually import it from to use the class methods as needed. You can see this approach in the [example/i18n.js](./example/i18n.js) file.

After creating and exporting your `NextI18Next` instance, you need to take the following steps to get things working:

1. Create an `_app.js` file inside your `pages` directory, and wrap it with the `NextI18Next.appWithTranslation` higher order component (HOC). You can see this approach in the [example/pages/_app.js](./example/pages/_app.js). 
2. Create a `server.js` file inside your root directory, initialise an [express](https://www.npmjs.com/package/express) server, and pass both the express server and NextJs app into `NextI18Next.nextI18NextMiddleware`. You can see this approach in the [example/server.js](./example/server.js)

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

### 3. Locale subpaths

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

## Options

| Key  | Default value |
| ------------- | ------------- |
| `defaultLanguage`  | `"en"`  |
| `otherLanguages` | `[]`  |
| `localePath` | `'static/locales'`  |
| `localeStructure` | `'{{lng}}/{{ns}}'`  |
| `localeSubpaths` | `false`  |
| `defaultNS` | `'common'`  |
| `use` (for plugins) | `[]`  |

_This table contains options which are specific to next-i18next. All other i18next options can be passed in as well._

## Notes

- [`next export` will result in a _clientside only_ React application.](https://github.com/isaachinman/next-i18next/issues/10)
- [We cannot support koa until a 1:1 replacement for `i18next-express-middleware` exists](https://github.com/isaachinman/next-i18next/issues/9).
- [To add a `lang` attribute to your top-level html DOM node, you must create a `_document.js` file.](https://github.com/isaachinman/next-i18next/issues/20#issuecomment-443461652)

## Contributing

Please do! All PRs and issues will be thoroughly reviewed.