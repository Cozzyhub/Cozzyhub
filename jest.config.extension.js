module.exports = {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'https://www.meesho.com/test-product/p/123456',
  },
  roots: ['<rootDir>/browser-extension'],
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/browser-extension/__tests__/setup.js'],
  collectCoverageFrom: [
    'browser-extension/**/*.js',
    '!browser-extension/__tests__/**',
    '!**/node_modules/**',
  ],
};
