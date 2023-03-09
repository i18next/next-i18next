## 13.2.2

- pageProps may be undefined on strange setups [#2109](https://github.com/i18next/next-i18next/issues/2109)"

## 13.2.1

- types: fix serverSideTranslations args [#2104](https://github.com/i18next/next-i18next/pull/2104)"

## 13.2.0

- types: Update serverSideTranslation args type [#2097](https://github.com/i18next/next-i18next/pull/2097)"

## 13.1.6

- fix: allow user provided affixes to be used without providing localeStructure [#2100](https://github.com/i18next/next-i18next/pull/2100)"

## 13.1.5

- [#2089](https://github.com/i18next/next-i18next/pull/2089), more stable impelementation of "feat(server-side): custom default config path [#2084](https://github.com/i18next/next-i18next/pull/2084)"

## 13.1.4

- revert #2084

## 13.1.3

- another code snippet for #2084 to try to fix for dynamic pages

## 13.1.2

- different code snippet for #2084 to try to fix for dynamic pages

## 13.1.1

- log config path if no config found

## 13.1.0

- feat(server-side): custom default config path [#2084](https://github.com/i18next/next-i18next/pull/2084)

## 13.0.3

- Error if custom localeStructure provided, but no ns option defined.

## 13.0.2

### Fix

- Types: DefaultNamespace import, see [#2061](https://github.com/i18next/next-i18next/pull/2061).

## 13.0.1

### Fix

- Fix missing `i18n.localeDetection` in UserConfig, see [#2057](https://github.com/i18next/next-i18next/pull/2057).
- Update examples to latest i18next in [#2058](https://github.com/i18next/next-i18next/pull/2058)

**Caution**

If you're experiencing typecheck errors regarding keys: ensure `i18next` is at least `^22.4.3` in your
package.json (then run install), see [#2058](https://github.com/i18next/next-i18next/pull/2058).

## 13.0.0

The v13.0.0 release is a major version to improve stability and general experience.
It comes with 2 easy changes related to installation. Existing code shouldn't be impacted.
Details can be found in the [UPGRADING.md](https://github.com/i18next/next-i18next/blob/master/UPGRADING.md#version-1300) document.

### Breaking changes

- [react-i18next](https://github.com/i18next/react-i18next) and [i18next](https://github.com/i18next/i18next)
  have been moved to peer-dependencies. They must be installed
  in your app ([#1966](https://github.com/i18next/next-i18next/pull/1966))

  ```bash
  # Add react-i18next > 12.0.0 and i18next > 22.0.4 to your app dependencies
  npm install react-i18next i18next --save  # NPM
  yarn add react-i18next i18next            # Yarn
  pnpm add react-i18next i18next --save     # PNPM
  ```

  This might solve issues with duplicates and multiple i18n context instances.
  If you encounter any issue, please read the [Troubleshoot](https://github.com/i18next/next-i18next/blob/master/TROUBLESHOOT.md) doc
  before posting an issue.

- Types augmentations are now handled by i18next instead of react-i18next ([#1997](https://github.com/i18next/next-i18next/pull/1997)).
  See the upgrade [document here](https://github.com/i18next/next-i18next/blob/master/UPGRADING.md#keys-typings).

### New

- Support for NextJs 13 (excluding new experimental layout / rsc)
- Upgrade to [i18next v22](https://github.com/i18next/i18next/releases) and react-i18next v12, see [#1966](https://github.com/i18next/next-i18next/pull/1966)
- Support for node 18 lts [#2017](https://github.com/i18next/next-i18next/pull/2017)

### Fix

- Fix types for appWithTranslation [#1987](https://github.com/i18next/next-i18next/pull/1987)

### New minimum versions

We've dropped support for nextjs < 12.0.0 / react < 17.0.2 ([#1983](https://github.com/i18next/next-i18next/pull/1983))
and node < 14 ([#1974](https://github.com/i18next/next-i18next/pull/1974)).

## 12.1.0

- fix: appWithTranslation re-renders \_app when the locale is changed (#1954)
- feat: introduce onPreInitI18next option (#1960)

## 12.0.1

- fix: fallbackLng if namespaces are undefined (#1943 closes #1941)

## 12.0.0

**Why a major version?**
The following changes could lead to more languages being loaded, which could increase the page size.

- feat: improve fallback language handling (#1927)
- feat: add support for nonExplicitSupportedLngs (#1930)

## 11.3.0

- feat: introduce extraLocales (#1916)

## 11.2.2

- fix: pass namespaces to the client also for custom backends (#1913)

## 11.2.1

- fix: pass namespaces to the client (#1912 closes #1839)

## 11.2.0

- feat: support nested namespace structure (#1911)

## 11.1.1

- fix: remove postinstall script

## 11.1.0

- first release with new project ownership
- update most dependencies
- update docs and example
- feat: support default locale by ignoring it (#1679)

## 11.0.0

**Features:**

- Allow client side translation loading (8132efd)

**Documentation:**

- Link to `react-i18next` config options (422a0f3)
