## Troubleshoot

### Can't find next-i18next.config.js

When working in a monorepo or with a package manager that makes use of symlinks (ie pnpm),
you might experience the following issue:

```
(...)next-i18next/dist/commonjs/serverSideTranslations.js
Critical dependency: the request of a dependency is an expression
Cannot find module '(...)app/next-i18next.config.js'
```

As a workaround you can explicitly provide the configuration:

```tsx
// _app.tsx
import type { AppProps } from 'next/app'
import { appWithTranslation } from 'next-i18next'
import nextI18NextConfig from '../next-i18next.config.js'
const MyApp = ({ Component, pageProps }: AppProps) => (
  <Component {...pageProps} />
)
export default appWithTranslation(MyApp, nextI18NextConfig)
```

For `getServerSideProps()` and `getStaticProps()` the recommended approach is
to wrap our `serverSideTranslations()` in a separate file where you can inject the
configuration.

```typescript
// ie: ./lib/i18n/getServerTranslations.ts
import type { SSRConfig, UserConfig } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18nextConfig from '../../next-i18next.config';

export const getServerTranslations = async (
  locale: string,
  namespacesRequired?: string[] | undefined,
  configOverride?: UserConfig
): Promise<SSRConfig> => {
  const config = configOverride ?? nextI18nextConfig;
  return serverSideTranslations(locale, namespacesRequired, config);
};
```


### Multiple instances

The `next-i18next` / `react-i18next` packages are relying on a react context to 
share data. Due to the nature of nextjs/ssr/react, the variety of package managers,
their configurations and versions, you might encounter the following warning: 

```
You will need to pass in an i18next instance by using initReactI18next
```

Before posting an issue, please ensure that you don't have duplicate versions of
`ì18next` and/or `react-i18next` installed. See [debug installation](#debug-installation)


### Debug installation

Since v13.0.0, i18next and react-i18next must be installed in your app dependencies. 
Some package managers might install them for you (auto install peer-deps). To avoid
install issues, please ensure i18next is `>=22.0.3` / next-i18next `>=12.0.0` and that  you don't have duplicates: 

| PM           | Check                            | Fix (only on semver)      |
|--------------|----------------------------------|---------------------------|
| yarn 1       | `npx -y yarn-deduplicate --list` | `npx -y yarn-deduplicate` |
| yarn 2+      | `yarn dedupe --list`             | `yarn dedupe`             |
| pnpm 7       | `npx -y pnpm-deduplicate --list` | `npx -y pnpm-deduplicate` |
| npm 8        | *not available*                  | `npm dedupe`              |

Another way to list duplicate is to use `npm why -r next-i18next i18next`, `pnpm why -r next-i18next i18next`
or `yarn why -R next-i18next && yarn why -R i18next`.

After fixing potential duplicates, run an installation (or update). A new lock file should be generated.




