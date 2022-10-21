## next

- breaking: drop nextjs < 12.0.0 and react < 17.0.2 in [#1983](https://github.com/i18next/next-i18next/pull/1983) 
- breaking: drop node 12.x support, requires 14.x. Recommended minimum to `^14.13.1`, 
  see [#1974](https://github.com/i18next/next-i18next/pull/1974)

## 12.1.0

- fix: appWithTranslation re-renders _app when the locale is changed (#1954)
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
