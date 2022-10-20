## Version 13.x

From version 13, both `i18next` and `react-i18next` have been moved to peerDependencies.
Be sure to install them in the consuming app or package by running:

```bash
yarn add react-i18next i18next
pnpm add react-i18next i18next --save
npm install react-i18next i18next --save
```

> **Note:**
> If you're having issues after update, please check that your dependencies 
> are properly deduplicated (ie: `yarn why react-i18next -R`, `pnpm why -r react-i18next i18next`...)
> or use `yarn dedupe --list`, `npx -y pnpm-dedpuplicate --list`, `npx -y yarn-deduplicate --list`...
