## Version 13.x

From version 13, both `i18next` and `react-i18next` have been moved to peerDependencies.
Be sure to install them in the consuming app or package by running:

```bash
yarn add react-i18next i18next
pnpm add react-i18next i18next --save
npm install react-i18next i18next --save
```

As of version 13.x, next-i18next supports i18next `^21.9.1 || ^22.0.1` range
react-i18next from `^11.18.4`. It's possible for the consuming application to 
select a specific supported version, ie `yarn add 'i18next@^21.10.0'`.

> **Note**
> If you're facing issues after upgrading, please first check that your dependencies 
> are properly deduplicated (ie: `yarn why react-i18next -R`, `pnpm why -r react-i18next i18next`...)
> or use `yarn dedupe --list`, `npx -y pnpm-dedpuplicate --list`, `npx -y yarn-deduplicate --list`.

