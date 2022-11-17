# Contributing

## Setup local dev environment

1. Clone the repo
2. Ensure you have a node version >=14, npm > 8

## Working on the code

Run npm install

```bash
npm install
```

Useful commands:

| Name                     | Description                                                            |
| ------------------------ | ---------------------------------------------------------------------- |
| `npm run lint`           | Run eslint over the codebase.                                          |
| `npm run typecheck`      | Run typescript typechecking.                                           |
| `npm run test`           | Run unit tests.                                                        |
| `npm run build`          | Run a build (creates dist files in ./dist folder)                      |
| `npm run check-dist`     | Check dist files for ecmascript compliance (requires build).           |
| `npm run check-size`     | Ensure dist files are under a certain size threshold (requires build). |
| `npm run check-size:why` | Open treemap of dist files (requires build)                            |
| `npm run clean`          | Clean all dist files.                                                  |

## E2E testing

First ensure the `examples/simple` app is installed.

```bash
npm run install:example:simple
```

To run the e2e test suite

```bash
npm run build && npm run move-build-to-examples
npm run build:examples
npm run test:e2e
```

## Working on examples

Examples nextjs apps live in the `examples/` folder.

```bash
npm run install:examples
npm run build:examples
```

## PRs

All PRs must pass all checks before they will be considered for review.

## Notes

Please be sure to comply with our [Developer's Certificate of Origin](https://github.com/i18next/i18next/blob/master/CONTRIBUTING.md)
