/* eslint-disable array-element-newline */
module.exports = {
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

  setupFiles: ['<rootDir>/jest.setup.js'],

  preset: 'jest-puppeteer',

  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/__tests__/test-i18next-config.ts',
    '<rootDir>/__tests__/types.test.ts',
    '<rootDir>/__tests__/config/test-helpers.ts',
    '<rootDir>/.e2e',
    '<rootDir>/examples/simple/__tests__/e2e/locale-subpaths-all.config.js',
    '<rootDir>/examples/simple/__tests__/e2e/locale-subpaths-foreign.config.js',
  ],
}
