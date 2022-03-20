# Client side loading of translations via HTTP

This examples shows a basic way of loading translations within a clientside rendered page. In general you should prefer static and server rendered pages where possible where you can benefit from preloading links in Next.js, however there are use cases where client side rendering and async loading of translations makes sense.

The include but not limited to
* client side only rendered components that you dont want to always load translations for at build
* Setting `fallback: true` while using incremental static regeneration - no server side methods like getStaticProps are run for the fallback page
* You want completely client side routing with no waiting for server or static props methods to run

## How does it work

On the server when using SSR the translations are loaded via the filesystem and then returned as page data via the `serverSideTranslations` method included in `next-i18next`. With our config we specify an alternative loading method purely for the browser environment. We're using three i18next backend plugins:
* [i18next-chained-backend](https://github.com/i18next/i18next-chained-backend)
* [i18next-http-backend](https://github.com/i18next/i18next-http-backend)
* [i18next-localstorage-backend](https://github.com/i18next/i18next-localstorage-backend)

The chained plugin allows us to chain together backend plugins so we can specify load strategies for our translations, i18next-http-backend allows you to load translations via fetch or XMLHttpRequest and finally i18next-localstorage-backend allows us to cache and then subsequently load our translations from localstorage. If your translation responses are sending a Cache-Control header, you may not need the i18next-localstorage-backend and i18next-chained-backend plugin.

Please read the i18next [Add or Load Translations docs](https://www.i18next.com/how-to/add-or-load-translations) and [Caching docs](https://www.i18next.com/how-to/caching) in order to see how to setup and use backend plugins. The config used [in this example](https://github.com/i18next/i18next-http-backend/tree/master/example/next) is shown below.

```js
const HttpBackend = require('i18next-http-backend/cjs')
const ChainedBackend= require('i18next-chained-backend').default
const LocalStorageBackend = require('i18next-localstorage-backend').default

module.exports = {
  backend: {
    backendOptions: [{ expirationTime: 60 * 60 * 1000 }, { /* loadPath: 'https:// somewhere else' */ }], // 1 hour
    backends: typeof window !== 'undefined' ? [LocalStorageBackend, HttpBackend]: [],
  },
  // debug: true,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
  },
  serializeConfig: false,
  use: typeof window !== 'undefined' ? [ChainedBackend] : [],
}
```

The config specifies that on the server we use the default load methods specified with `next-i18next` but on the browser we load the ChainedBackend plugin which then firstly tries to load translations from localstorage, if they dont exist there then it falls back to the HttpBackend which then will query them from our backend and then pass them back to the localStorage backend which then caches them for reuse.

## Setup

### 1. Installation

Yarn
```
yarn add next-i18next i18next-chained-backend i18next-http-backend i18next-localstorage-backend
```

npm
```
npm i --save next-i18next i18next-chained-backend i18next-http-backend i18next-localstorage-backend
```

### 2. Setup next-i18next

Setup `next-i18next` as described in the [README](https://github.com/isaachinman/next-i18next/blob/master/README.md#2-translation-content)

### 3. Pass your config as an override config to the appWithTranslation HOC

This step is necessary as usually when server rendering/loading your translations `next-i18next` will load your config from the pageProps but seen as you're not using `getServerSideProps` or `getStaticProps` here you'll need another way to load your config into the I18nProvider

```tsx
import { appWithTranslation } from 'next-i18next'
import nextI18nConfig from '../next-i18next.config'

const MyApp = ({ Component, pageProps }) => (
  <Component {...pageProps} />
);

export default appWithTranslation(MyApp, nextI18nConfig);
```

### 4. Setup your client rendered pages/components

Use the `ready` property from `useTranslation` to ensure the i18next instance is ready and that your translations are loaded to avoid the user seeing bare translation keys, below is a very simplistic example of this.

```jsx
// getServerSideProps and getStaticProps are not used (no serverSideTranslations method)
const ClientPage = () => {
  const { t, ready } = useTranslation('client-page')

  return (
    <>
      <main>
        <Text>{ready ? t('h1') : ''}</Text>
      </main>
      <Footer />
    </>
  )
}

export default ClientPage
```

**The complete example can be found [here](https://github.com/i18next/i18next-http-backend/tree/master/example/next).**
