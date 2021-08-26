/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  transform: {
    '.(ts|tsx)$': require.resolve('ts-jest/dist'),
    // '.(js|jsx)$': require.resolve('babel-jest'), // jest's default
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/**/*.(spec|test).{ts,tsx}'],
  testURL: 'http://localhost',
  watchPlugins: [
    require.resolve('jest-watch-typeahead/filename'),
    require.resolve('jest-watch-typeahead/testname'),
  ],
};
