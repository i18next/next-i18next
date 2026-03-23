module.exports = {
  automock: false,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  moduleDirectories: ['node_modules', 'src', 'src/pagesRouter'],
  moduleNameMapper: {
    createClient: '<rootDir>/src/pagesRouter/createClient/browser.ts',
  },
  rootDir: '.',
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
  ],
}
