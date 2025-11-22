// Authentication Integration Tests
const request = require('supertest');
const app = require('../../src/app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Skip integration tests if database is not available
const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

describeIfDb('Authentication Integration', () => {
  // Clean up test users before and after tests
  beforeEach(async () => {
    try {
      // Delete test users
      await prisma.users.deleteMany({
        where: {
          email: {
            contains: 'authtest',
          },
        },
      });
    } catch (error) {
      console.warn('⚠️ Could not clean test data:', error.message);
    }
  });

  afterAll(async () => {
    try {
      // Clean up all test data
      await prisma.users.deleteMany({
        where: {
          email: {
            contains: 'authtest',
          },
        },
      });
      await prisma.$disconnect();
    } catch (error) {
      console.warn('⚠️ Could not clean up:', error.message);
    }
  });

  describe('POST /api/auth/register', () => {
    test('should register new user successfully with valid data', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: `authtest${Date.now()}@example.com`,
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'User registered successfully',
      });
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.user).toMatchObject({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
      });
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data.user).toHaveProperty('id');
    });

    test('should reject registration with missing fields', async () => {
      const userData = {
        firstName: 'Test',
        email: `authtest${Date.now()}@example.com`,
        // Missing lastName and password
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'All fields are required',
      });
    });

    test('should reject registration with mismatched passwords', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: `authtest${Date.now()}@example.com`,
        password: 'SecurePassword123!',
        confirmPassword: 'DifferentPassword123!',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Passwords do not match',
      });
    });

    test('should reject registration with duplicate email', async () => {
      const email = `authtest${Date.now()}@example.com`;
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: email,
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
      };

      // First registration should succeed
      await request(app).post('/api/auth/register').send(userData).expect(201);

      // Second registration with same email should fail
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/already exists|duplicate/i);
    });

    test('should reject registration with invalid email format', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'invalid-email-format',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      // Create a test user for login tests
      const email = `authtest${Date.now()}@example.com`;
      const response = await request(app).post('/api/auth/register').send({
        firstName: 'Login',
        lastName: 'Test',
        email: email,
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
      });

      testUser = {
        email: email,
        password: 'TestPassword123!',
      };
    });

    test('should login registered user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Login successful',
      });
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user).not.toHaveProperty('password');

      // Check for refresh token cookie
      expect(response.headers['set-cookie']).toBeDefined();
      const cookies = response.headers['set-cookie'];
      const hasRefreshToken = cookies.some((cookie) =>
        cookie.includes('refreshToken'),
      );
      expect(hasRefreshToken).toBe(true);
    });

    test('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
      });
      expect(response.body.message).toMatch(/invalid|credentials/i);
    });

    test('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        })
        .expect(401);

      expect(response.body).toMatchObject({
        success: false,
      });
      expect(response.body.message).toMatch(/invalid|credentials|not found/i);
    });

    test('should reject login with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'SomePassword123!',
        })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Email and password are required',
      });
    });

    test('should reject login with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
        })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Email and password are required',
      });
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should logout successfully', async () => {
      const response = await request(app).post('/api/auth/logout').expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Logged out successfully',
      });

      // Check that refresh token cookie is cleared
      const cookies = response.headers['set-cookie'] || [];
      const hasExpiredRefreshToken = cookies.some(
        (cookie) =>
          cookie.includes('refreshToken') && cookie.includes('Expires='),
      );
      expect(hasExpiredRefreshToken).toBe(true);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken;

    beforeEach(async () => {
      // Register and login to get a refresh token
      const email = `authtest${Date.now()}@example.com`;
      await request(app).post('/api/auth/register').send({
        firstName: 'Refresh',
        lastName: 'Test',
        email: email,
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
      });

      const loginResponse = await request(app).post('/api/auth/login').send({
        email: email,
        password: 'TestPassword123!',
      });

      // Extract refresh token from cookie
      const cookies = loginResponse.headers['set-cookie'];
      const refreshCookie = cookies.find((cookie) =>
        cookie.startsWith('refreshToken='),
      );
      if (refreshCookie) {
        refreshToken = refreshCookie.split(';')[0].split('=')[1];
      }
    });

    test('should refresh valid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Token refreshed successfully',
      });
      expect(response.body.data).toHaveProperty('accessToken');
    });

    test('should reject refresh without token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Refresh token required',
      });
    });

    test('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token-string' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // TODO: Add more integration test cases
});

module.exports = {};
