const defaults = {
  launchTimeout: 30000,
}

const e2eTests = {
  BASIC: {
    port: 4001,
  },
  LOCALE_SUBPATHS_FOREIGN: {
    port: 4002,
  },
  LOCALE_SUBPATHS_ALL: {
    port: 4003,
  },
}

module.exports = {
  e2eTests,
  server: [
    {
      ...e2eTests.BASIC,
      ...defaults,
      command: `cd examples/simple && PORT=${e2eTests.BASIC.port} NODE_ENV=production node index.js`,
    },
    {
      ...e2eTests.LOCALE_SUBPATHS_FOREIGN,
      ...defaults,
      command: `cd examples/simple && LOCALE_SUBPATHS=foreign PORT=${e2eTests.LOCALE_SUBPATHS_FOREIGN.port} NODE_ENV=production node index.js`,
    },
    {
      ...e2eTests.LOCALE_SUBPATHS_ALL,
      ...defaults,
      command: `cd examples/simple && LOCALE_SUBPATHS=all PORT=${e2eTests.LOCALE_SUBPATHS_ALL.port} NODE_ENV=production node index.js`,
    },
  ],
}
