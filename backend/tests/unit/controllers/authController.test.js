// Authentication Controller Unit Tests
const authController = require('../../../src/controllers/authController');
const authService = require('../../../src/services/authService');

// Mock the auth service
jest.mock('../../../src/services/authService');

describe('AuthController Unit Tests', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock request object
    mockReq = {
      body: {},
      cookies: {},
    };

    // Mock response object
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };

    // Mock next function
    mockNext = jest.fn();
  });

  describe('login', () => {
    test('should login with valid credentials', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };
      const mockTokens = {
        user: mockUser,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      mockReq.body = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      authService.login.mockResolvedValue(mockTokens);

      await authController.login(mockReq, mockRes, mockNext);

      expect(authService.login).toHaveBeenCalledWith(
        'test@example.com',
        'Password123!',
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'mock-refresh-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'Strict',
        }),
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: {
          user: mockUser,
          accessToken: 'mock-access-token',
        },
      });
    });

    test('should reject login with missing email', async () => {
      mockReq.body = {
        password: 'Password123!',
      };

      await authController.login(mockReq, mockRes, mockNext);

      expect(authService.login).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email and password are required',
      });
    });

    test('should reject login with missing password', async () => {
      mockReq.body = {
        email: 'test@example.com',
      };

      await authController.login(mockReq, mockRes, mockNext);

      expect(authService.login).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email and password are required',
      });
    });

    test('should handle invalid credentials error', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      authService.login.mockRejectedValue(new Error('Invalid credentials'));

      await authController.login(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials',
      });
    });
  });

  describe('register', () => {
    test('should register new user with valid data', async () => {
      const mockUser = {
        id: 1,
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
      };
      const mockTokens = {
        user: mockUser,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      mockReq.body = {
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };

      authService.register.mockResolvedValue(mockTokens);

      await authController.register(mockReq, mockRes, mockNext);

      expect(authService.register).toHaveBeenCalledWith({
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@example.com',
        password: 'Password123!',
      });
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'mock-refresh-token',
        expect.any(Object),
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully',
        data: mockTokens,
      });
    });

    test('should reject registration with mismatched passwords', async () => {
      mockReq.body = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
      };

      await authController.register(mockReq, mockRes, mockNext);

      expect(authService.register).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Passwords do not match',
      });
    });

    test('should reject registration with missing fields', async () => {
      mockReq.body = {
        firstName: 'Test',
        email: 'test@example.com',
        // Missing lastName and passwords
      };

      await authController.register(mockReq, mockRes, mockNext);

      expect(authService.register).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'All fields are required',
      });
    });

    test('should handle duplicate email error', async () => {
      mockReq.body = {
        firstName: 'Test',
        lastName: 'User',
        email: 'existing@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };

      const error = new Error('Email already exists');
      authService.register.mockRejectedValue(error);

      await authController.register(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('logout', () => {
    test('should logout successfully', async () => {
      await authController.logout(mockReq, mockRes, mockNext);

      expect(mockRes.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logged out successfully',
      });
    });

    test('should handle logout errors', async () => {
      const error = new Error('Logout failed');
      mockRes.clearCookie.mockImplementation(() => {
        throw error;
      });

      await authController.logout(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('refreshToken', () => {
    test('should refresh token from cookie', async () => {
      mockReq.cookies.refreshToken = 'valid-refresh-token';

      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      authService.refreshToken.mockResolvedValue(mockTokens);

      await authController.refreshToken(mockReq, mockRes, mockNext);

      expect(authService.refreshToken).toHaveBeenCalledWith(
        'valid-refresh-token',
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'new-refresh-token',
        expect.any(Object),
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: 'new-access-token',
          newRefreshToken: 'new-refresh-token',
        },
      });
    });

    test('should refresh token from body', async () => {
      mockReq.body.refreshToken = 'valid-refresh-token';

      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      authService.refreshToken.mockResolvedValue(mockTokens);

      await authController.refreshToken(mockReq, mockRes, mockNext);

      expect(authService.refreshToken).toHaveBeenCalledWith(
        'valid-refresh-token',
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    test('should reject refresh without token', async () => {
      await authController.refreshToken(mockReq, mockRes, mockNext);

      expect(authService.refreshToken).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Refresh token required',
      });
    });

    test('should handle invalid refresh token', async () => {
      mockReq.cookies.refreshToken = 'invalid-token';

      const error = new Error('Invalid refresh token');
      authService.refreshToken.mockRejectedValue(error);

      await authController.refreshToken(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});

module.exports = {};
