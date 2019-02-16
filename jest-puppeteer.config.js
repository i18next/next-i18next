const defaults = {
  launchTimeout: 30000,
}

const e2eTests = {
  BASIC: {
    port: 4001,
  },
  LOCALE_SUBPATHS: {
    port: 4002,
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
      ...e2eTests.LOCALE_SUBPATHS,
      ...defaults,
      command: `cd examples/simple && LOCALE_SUBPATHS=true PORT=${e2eTests.LOCALE_SUBPATHS.port} NODE_ENV=production node index.js`,
    },
  ],
}
