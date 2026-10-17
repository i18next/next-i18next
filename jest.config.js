module.exports = {
  automock: false,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  moduleDirectories: ['node_modules', 'src', 'src/pagesRouter'],
  moduleNameMapper: {
    createClient: '<rootDir>/src/pagesRouter/createClient/browser.ts',
  },
  rootDir: '.',
  // ESM-only dependencies of i18next-icu and i18next-mf2
  transformIgnorePatterns: [
    '/node_modules/(?!(intl-messageformat|@formatjs|messageformat)/)',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
  ],
}
