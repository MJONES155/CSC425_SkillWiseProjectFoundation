// TODO: Test environment setup and configuration
const { Pool } = require('pg');

// Determine if this is an integration test or unit test
const isIntegrationTest = process.argv.some((arg) =>
  arg.includes('integration'),
);

// Test database configuration
const testDbConfig = {
  connectionString:
    process.env.TEST_DATABASE_URL ||
    'postgresql://skillwise_user:skillwise_pass@localhost:5432/skillwise_test_db',
  // Reduce connections for test environment
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 1000,
};

const testPool = isIntegrationTest ? new Pool(testDbConfig) : null;

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only';

  // Test database connection only for integration tests
  if (isIntegrationTest && testPool) {
    try {
      await testPool.query('SELECT 1');
      console.log('✅ Test database connected');
    } catch (err) {
      console.error('❌ Test database connection failed:', err.message);
      throw err;
    }
  } else {
    console.log('⚡ Running unit tests without database');
  }
});

// Global test cleanup
afterAll(async () => {
  try {
    // Close database connections only if pool exists
    if (testPool) {
      await testPool.end();
    }
    console.log('✅ Test cleanup completed');
  } catch (err) {
    console.error('❌ Test cleanup failed:', err.message);
  }
});

// Helper function to clear test data between tests
const clearTestData = async () => {
  const tables = [
    'user_achievements',
    'achievements',
    'leaderboard',
    'progress_events',
    'peer_reviews',
    'ai_feedback',
    'submissions',
    'challenges',
    'goals',
    'refresh_tokens',
    'users',
  ];

  for (const table of tables) {
    try {
      await testPool.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
    } catch (err) {
      // Table might not exist, continue
      console.warn(`Warning: Could not truncate table ${table}:`, err.message);
    }
  }
};

// Export test utilities
module.exports = {
  testPool,
  clearTestData,
};
