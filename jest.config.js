/* eslint-disable array-element-newline */
module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest'
  },

  globals: {
    'ts-jest': {
      tsConfig: {
        jsx: 'react',
        noEmit: true,
        target: 'es5'
      }
    }
  },

  automock: false,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/index.ts',
    '!src/components/index.ts',
    '!src/hocs/index.ts',
    '!src/middlewares/index.ts',
    '!src/utils/index.ts',
    '!src/router/index.ts',
  ],

  setupFiles: ['<rootDir>/jest.setup.ts'],

  preset: 'jest-puppeteer',
  globalSetup: 'jest-environment-puppeteer/setup',
  globalTeardown: 'jest-environment-puppeteer/teardown',
  testEnvironment: 'jest-environment-puppeteer',

  testPathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/__tests__/test-i18next-config.ts',
    '<rootDir>/__tests__/types.test.ts',
    '<rootDir>/__tests__/config/test-helpers.ts',
  ],
}
