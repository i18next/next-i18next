## Troubleshoot

### Multiple instances

The `next-i18next` / `react-i18next` packages are relying on a react context to 
share data. Due to the nature of nextjs/ssr/react, the variety of package managers,
their configurations and versions, you might encounter the following warning: 

```
You will need to pass in an i18next instance by using initReactI18next
```

Before posting an issue, please ensure that you don't have duplicate versions of
`ì18next` and/or `react-i18next` installed. 

Depending on you package manager you can list or fix duplicates by:

| PM           | Check                            | Fix (only on semver)      |
|--------------|----------------------------------|---------------------------|
| yarn 1       | `npx -y yarn-deduplicate --list` | `npx -y yarn-deduplicate` |
| yarn 2+      | `yarn dedupe --list`             | `yarn dedupe`             |
| pnpm 7       | `npx -y pnpm-deduplicate --list` | `npx -y pnpm-deduplicate` |
| npm 8        | *not available*                  | `npm dedupe`              |

Followed by an installation (or update). A new lock file should be generated.

Another way to list duplicate is to use `npm why -r next-i18next i18next`, `pnpm why -r next-i18next i18next` 
or `yarn why -R next-i18next && yarn why -R i18next`.

If it does not fix the problem, search for similar issues and/or drop a new one (having versions helps to narrow possible causes)


