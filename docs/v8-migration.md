# Migration Guide v7 to v8

Please read the [full documentation](https://github.com/isaachinman/next-i18next/blob/master/README.md), before migrating from previous versions to v8.

This is a guide which will cover most use cases to migrate from v7 to v8.
We advise migrating as soon as possible, as new versions of NextJs won't be compatible with the v7 of this package `next-i18next`.

#### What is new?

This package, `next-i18next`, has changed a lot because it now is _not_ providing internationalised routing anymore, as [NextJs has first class support for it.](https://nextjs.org/docs/advanced-features/i18n-routing)

Before the translation functionality was initialised on a global level, in `_app.js`. Now, you must use a new method, called `serverSideTranslations` on*each* page in your `pages` directory.

The object `i18n` which was imported directly from `i18n.js` in `next-i18next@<8` suppored only client-side-rendering. Now in the v8 the `i18n` object also supports server-side rendering. So you can use the `i18n.language` for server-side rendered elements.

#### What is the same?

1. `appWithTranslation` still wraps the App in `_app.js`
2. `withTranslation` works the same way
3. `useTranslation` works the same way
4. The [translation content structure](https://github.com/isaachinman/next-i18next/blob/master/README.md#2-translation-content) remains the same

#### Step By Step Migration Guide

1.  Remove `i18n.js` and add `next-i18next.config.js` as described in [the docs](https://github.com/isaachinman/next-i18next#3-project-setup) to your `next.config.js` file
2.  Replace `import { appWithTranslation } from 'i18n'` with `import { appWithTranslation } from 'next-i18next'`
3.  Replace all instances of `import { withTranslation } from 'i18n` to `import { withTranslation } from 'next-i18next'`
4.  Replace all instances of `import { useTranslation } from 'i18n` to `import { useTranslation } from 'next-i18next'`
5.  Add to `getServerSideProps` or `getInitialProps` in the return as props`...(await serverSideTranslations(locale, [<YOUR_NAMESPACES>]))` in every single page where you have translations. Note that if you have a component in `_app` that needs translations, you will have to do this for _all_ pages. Follow [the docs.](https://github.com/isaachinman/next-i18next#serversidetranslations)
6.  Remove `namespacesRequired: ['common'],` in `_app.js` (not used anymore)
7.  To change language imperatively, you can now do: `router.push(router.asPath, undefined, { locale: <YOUR_LOCALE>, });`

#### Optional

1. Add to the custom 404 page the `...(await serverSideTranslations(locale, [<YOUR_NAMESPACES>])),` as a return in props in `getStaticProps` so the 404 page works with translations as well
2. Add to the custom 500 page the `...(await serverSideTranslations(locale, [<YOUR_NAMESPACES>])),` as a return in props in `getStaticProps` so the 404 page works with translations as well
3. Add set cookie `NEXT_LOCALE` for language recognition. More about that in [the NextJs docs](https://nextjs.org/docs/advanced-features/i18n-routing#leveraging-the-next_locale-cookie)
4. Adjust the Jest test settings to mock `withTranslation`,`useTranslation`, and `t()` or/and `i18n` in props.

More info in the [full documentation](https://github.com/isaachinman/next-i18next/blob/master/README.md), or in the [next.js documentation.](https://nextjs.org/docs/advanced-features/i18n-routing)
