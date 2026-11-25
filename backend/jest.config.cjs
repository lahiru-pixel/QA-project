module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/unit/**/*.test.cjs'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.cjs'],
  clearMocks: true,
  restoreMocks: true,
  // Include untested routes in the denominator; do not report middleware-only
  // numbers as coverage for the entire backend.
  collectCoverageFrom: ['middleware/**/*.js', 'routes/**/*.js'],
  coverageProvider: 'babel',
  coverageDirectory: '<rootDir>/../testing-docs/unit-testing/coverage',
  coverageReporters: ['text', 'html', 'lcovonly', 'json', 'json-summary'],
};

