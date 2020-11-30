/* eslint-disable array-element-newline */
module.exports = {
  automock: false,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
  ],

  setupFiles: ['<rootDir>/jest.setup.js'],

  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],
}
