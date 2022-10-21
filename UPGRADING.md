## Version 13.x

Both `i18next` and `react-i18next` have been moved to [peerDependencies](https://github.com/npm/rfcs/blob/main/implemented/0030-no-install-optional-peer-deps.md)
and must be installed part of `next-i18next`. When upgrading don't forget to add them to your dependencies:

```bash
npm install react-i18next i18next --save  # NPM
yarn add react-i18next i18next            # Yarn
pnpm add react-i18next i18next --save     # PNPM
```

This move was done in the hope to avoid issues regarding duplicates. See the
[TROUBLESHOOT](https://github.com/i18next/next-i18next/blob/master/TROUBLESHOOT.md#multiple-instances)
for more info. In the future it will also allow to support multiple ranges.


