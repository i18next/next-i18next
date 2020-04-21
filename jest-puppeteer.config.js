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
      command: `pwd && ls examples/simple && PORT=${e2eTests.BASIC.port} yarn --cwd examples/simple start`,
    },
    {
      ...e2eTests.LOCALE_SUBPATHS_FOREIGN,
      ...defaults,
      command: `ls .e2e/locale-subpaths-foreign && yarn --cwd .e2e/locale-subpaths-foreign && yarn --cwd .e2e/locale-subpaths-foreign build && PORT=${e2eTests.LOCALE_SUBPATHS_FOREIGN.port} yarn --cwd .e2e/locale-subpaths-foreign start`,
    },
    {
      ...e2eTests.LOCALE_SUBPATHS_ALL,
      ...defaults,
      command: `ls .e2e/locale-subpaths-all && yarn --cwd .e2e/locale-subpaths-all && yarn --cwd .e2e/locale-subpaths-all build && PORT=${e2eTests.LOCALE_SUBPATHS_ALL.port} yarn --cwd .e2e/locale-subpaths-all start`,
    },
  ],
}
