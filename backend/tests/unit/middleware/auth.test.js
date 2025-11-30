jest.mock('jsonwebtoken');
jest.mock('@prisma/client');

let jwt;
let PrismaModule;
const { AppError } = require('../../../src/middleware/errorHandler');

describe('Auth Middleware', () => {
  let req, res, next, prismaMock, auth;

  beforeEach(() => {
    jest.resetModules();

    // Re-require mocked modules after reset
    jwt = require('jsonwebtoken');
    PrismaModule = require('@prisma/client');

    req = {
      headers: {},
    };
    res = {};
    next = jest.fn();

    // Mock Prisma client
    prismaMock = {
      user: {
        findUnique: jest.fn(),
      },
    };
    PrismaModule.PrismaClient.mockImplementation(() => prismaMock);

    // Require the middleware AFTER setting Prisma mock implementation
    auth = require('../../../src/middleware/auth');
  });

  test('should authenticate valid JWT token', async () => {
    req.headers.authorization = 'Bearer validtoken';

    // Mock jwt.verify returning decoded payload
    jwt.verify.mockReturnValue({ id: 123 });

    // Mock DB user existing
    prismaMock.user.findUnique.mockResolvedValue({ id: 123, name: 'Megan' });

    await auth(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      'validtoken',
      process.env.JWT_SECRET
    );
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: 123 },
    });
    expect(req.user).toEqual({ id: 123, name: 'Megan' });
    expect(next).toHaveBeenCalledWith();
  });

  test('should reject invalid token', async () => {
    req.headers.authorization = 'Bearer invalidtoken';

    const error = new Error('Invalid token');
    error.name = 'JsonWebTokenError';

    jwt.verify.mockImplementation(() => {
      throw error;
    });

    await auth(req, res, next);

    expect(next).toHaveBeenCalled();
    const passedError = next.mock.calls[0][0];

    expect(passedError.code).toBe('INVALID_TOKEN');
  });

  test('should reject expired token', async () => {
    req.headers.authorization = 'Bearer expiredtoken';

    const error = new Error('Token expired');
    error.name = 'TokenExpiredError';

    jwt.verify.mockImplementation(() => {
      throw error;
    });

    await auth(req, res, next);

    const passedError = next.mock.calls[0][0];
    expect(passedError.code).toBe('TOKEN_EXPIRED');
  });

  test('should reject missing token', async () => {
    req.headers = {}; // no Authorization header

    await auth(req, res, next);

    const passedError = next.mock.calls[0][0];
    expect(passedError.code).toBe('NO_TOKEN');
  });

  test('should reject when user no longer exists', async () => {
    req.headers.authorization = 'Bearer validtoken';

    jwt.verify.mockReturnValue({ id: 999 });

    // DB returns null
    prismaMock.user.findUnique.mockResolvedValue(null);

    await auth(req, res, next);

    const passedError = next.mock.calls[0][0];
    expect(passedError.message).toMatch(/does no longer exist/i);
  });
});

module.exports = {};
