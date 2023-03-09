## Version 13.0.0

Version 13.0.0 comes with 2 breaking changes in order to improve developer experience and
stability.

### New installation requirements

Both `i18next` and `react-i18next` have been moved to [peerDependencies](https://github.com/npm/rfcs/blob/main/implemented/0030-no-install-optional-peer-deps.md)
and must be installed part of `next-i18next`. When upgrading don't forget to add them to your dependencies:

```bash
npm install react-i18next i18next --save  # NPM
yarn add react-i18next i18next            # Yarn
pnpm add react-i18next i18next --save     # PNPM
```

Minimum versions supported are `i18next@^22.0.6` and `react-i18next@^12.0.0`.

This move was done in the hope to avoid issues regarding duplicates. In case of issue when
uĝrading, see the [TROUBLESHOOT](https://github.com/i18next/next-i18next/blob/master/TROUBLESHOOT.md#need-to-pass-in-an-i18next-instance)
to ensure peer-dependencies are properly installed.

### Keys typings

If you're using typescript type augmentation for your locale keys, they've been moved from `react-i18next` to [i18next](https://www.i18next.com/overview/typescript).
Rename `@types/react-i18next.d.ts` to `@types/i18next.d.ts` and be sure to update the imports:

```typescript
import 'i18next' // before v13.0.0 -> import 'react-i18next';
import type common from '../public/locales/en/common.json'
import type other from '../public/locales/en/other.json'

interface I18nNamespaces {
  common: typeof common
  other: typeof other
}
// before v13.0.0 -> declare module 'react-i18next'
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: I18nNamespaces
  }
}
```
