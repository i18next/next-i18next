module.exports = {
  automock: false,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
  ],

  moduleDirectories: [
    'node_modules',
    'src',
  ],
  moduleNameMapper: {
    createClient: '<rootDir>/src/createClient/browser.ts',
  },

  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
  ],
}
