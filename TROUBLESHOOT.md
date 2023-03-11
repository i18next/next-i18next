## Troubleshoot

### Issues

#### Need to pass in an i18next instance

The `next-i18next` / `react-i18next` packages are relying on a react context to
share data. Due to the nature of nextjs/ssr/react, the variety of package managers,
their configurations and versions, you might encounter the following warning:

```
You will need to pass in an i18next instance by using initReactI18next
```

To fix:

1. Ensure no duplicate versions of `ì18next` and/or `react-i18next` co-exists. See [debug installation](#how-to-debug-installation).
2. Optionally adapt your setup to [explicitly pass the config](#how-to-explicitly-pass-the-config) recommendations.

#### Can't find next-i18next.config.js

In monorepo or package managers creating symlinks in node_modules (ie: pnpm) you
might experience.

```
(...)next-i18next/dist/commonjs/serverSideTranslations.js
Critical dependency: the request of a dependency is an expression
Cannot find module '(...)app/next-i18next.config.js'
```

You can solve it by [explicitly passing the config](#how-to-explicitly-pass-the-config).

### Recipes

#### How to explicitly pass the config

By default, next-i18next will automatically load a `next-i18n.config.js` located in the project root
directory. In monorepos / workspace enabled projects the detection of the current project directory
might fail (depending on where the package manager actually hoist the next-i18next package). If you're impacted
a good way to circumvent the issue is to pass the config explicitly. It also allows
to choose a different extension (.mjs, .cjs).

This generally fix [can't find next-i18next.config.js](#cant-find-next-i18nextconfigjs) (and eventual [need to pass in an i18next instance](#need-to-pass-in-an-i18next-instance)).

1. in _app.tsx

   ```tsx
   // _app.tsx
   import type { AppProps } from 'next/app'
   import { appWithTranslation } from 'next-i18next'
   import nextI18NextConfig from '../next-i18next.config'
   const MyApp = ({ Component, pageProps }: AppProps) => (
     <Component {...pageProps} />
   )
   export default appWithTranslation(MyApp, nextI18NextConfig)
   ```

2. For `getServerSideProps()` and `getStaticProps()` the recommended approach is
   to wrap our [serverSideTranslations()](https://github.com/i18next/next-i18next/blob/master/src/serverSideTranslations.ts) in a separate file where you can inject the
   configuration.

   ```typescript
   // ie: ./lib/i18n/getServerTranslations.ts
   import type { Namespace } from 'i18next';
   import type { SSRConfig, UserConfig } from 'next-i18next'
   import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
   import nextI18nextConfig from '../../next-i18next.config'

   type ArrayElementOrSelf<T> = T extends Array<infer U> ? U[] : T[];

   export const getServerTranslations = async (
     locale: string,
     namespacesRequired?: ArrayElementOrSelf<Namespace> | undefined,
     configOverride?: UserConfig,
     extraLocales?: string[] | false
   ): Promise<SSRConfig> => {
     const config = configOverride ?? nextI18nextConfig
     return serverSideTranslations(locale, namespacesRequired, config,  extraLocales)
   }
   ```

   And use it instead of `serverSideTranslations`:

   ```typescript
   import { getServerTranslations } from '@/lib/i18n';
   const i18nNamespaces = ['demo'];

   export default function DemoRoute(
      props: InferGetStaticPropsType<typeof getStaticProps>
   ) {
     // ...
   }

   export const getStaticProps: GetStaticProps<Props> = async (context) => {
      const { locale } = context;
      return {
        props: {
          ...(await getServerTranslations(locale, i18nNamespaces)),
        },
      };
   };
   ```

#### How to debug installation

1. Since v13.0.0, [i18next](https://github.com/i18next/i18next) and [react-i18next](https://github.com/i18next/react-i18next)
   must be explicitly installed in your app dependencies as well (peer-deps of next-i8next). Check first they are well present
   in your package.json (`"i18next": "^22.0.6"` and `"react-i18next": "^12.0.0"`)


2. Recent versions of pnpm (>=7.29) / yarn (>=3) / npm (>=8) should be able to dedupe installed versions for you.
   In case of issue, try to dedupe manually

   | PM             | Check                            | Fix (only on semver)      |
   |----------------|----------------------------------|---------------------------|
   | yarn 1         | `npx -y yarn-deduplicate --list` | `npx -y yarn-deduplicate` |
   | yarn 2+        | `yarn dedupe --list`             | `yarn dedupe`             |
   | pnpm < 7.23.0  | `npx -y pnpm-deduplicate --list` | `npx -y pnpm-deduplicate` |
   | pnpm >= 7.23.0 | _not available_                  | `pnpm dedupe`             |
   | npm 8          | _not available_                  | `npm dedupe`              |

   > You can also list duplicate with `npm why -r next-i18next i18next`, `pnpm why -r next-i18next i18next`
   > or `yarn why -R next-i18next && yarn why -R i18next`.

3. PNPM < 7.29.0 might have issues with peer deduplication in monorepo. This will be addressed in v8, but
   starting with 7.29.0 you can already set these settings in `.npmrc`.

   ```
   # https://pnpm.io/next/npmrc
   use-lockfile-v6=true
   # https://github.com/pnpm/pnpm/releases/tag/v7.29.0
   dedupe-peer-dependents=true
   resolve-peers-from-workspace-root=true
   ```

After fixing potential duplicates, run an installation (or update). A new lock file should be generated.
