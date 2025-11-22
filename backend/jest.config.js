module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  testPathIgnorePatterns: [
    '/node_modules/',
    // Ignore integration tests (require database)
    'tests/integration/',
    // Ignore placeholder test files that aren't implemented yet
    'tests/unit/services/goalService.test.js',
    'tests/unit/services/authService.test.js',
    'tests/unit/services/aiService.test.js',
    'tests/unit/middleware/auth.test.js',
    'tests/unit/middleware/validation.test.js',
    'tests/unit/utils/jwt.test.js',
    'tests/unit/utils/validators.test.js',
    'tests/unit/controllers/goalController.test.js',
    'tests/unit/controllers/challengeController.test.js',
  ],
  collectCoverageFrom: ['src/**/*.js', '!src/database/**', '!src/config/**'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
