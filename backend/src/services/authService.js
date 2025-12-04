// TODO: Implement authentication business logic
const jwt = require('../utils/jwt');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const Sentry = require('@sentry/node');
const securityEvents = require('./securityEvents');
const prisma = new PrismaClient();

// In-memory tracking of failed attempts (simple baseline; replace with Redis for distributed)
const failedAttempts = new Map(); // key: email, value: count
const MAX_FAILED_BEFORE_NOTICE = parseInt(
  process.env.MAX_FAILED_LOGIN_NOTICE || '3'
);

function recordFailedAttempt(email, reason) {
  const current = failedAttempts.get(email) || 0;
  const next = current + 1;
  failedAttempts.set(email, next);
  const payload = {
    email,
    reason,
    attempts: next,
    timestamp: new Date().toISOString(),
  };
  // Emit internal event for optional listeners (e.g., metrics, alerts)
  securityEvents.emit('invalid-login', payload);
  // Lightweight Sentry message (not an exception)
  Sentry.captureMessage(`Invalid login attempt: ${reason}`, {
    level: 'warning',
    extra: { email, attempts: next },
  });
  // Escalation hook if threshold exceeded (future: notify, captcha, lockout)
  if (next === MAX_FAILED_BEFORE_NOTICE) {
    securityEvents.emit('account-lockout', {
      email,
      reason: 'threshold-reached',
      timestamp: new Date().toISOString(),
    });
    Sentry.captureMessage('Login failure threshold reached', {
      level: 'info',
      extra: { email, attempts: next },
    });
  }
}

const authService = {
  // TODO: Implement user login logic
  login: async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      recordFailedAttempt(email, 'unknown-email');
      const err = new Error('There is no account associated with that email');
      console.error('🚨 Invalid login attempt - unknown email:', {
        email,
        timestamp: new Date().toISOString(),
      });
      Sentry.captureException(err, {
        level: 'error',
        extra: { email, reason: 'unknown-email' },
        tags: { area: 'auth', type: 'invalid-login' },
      });
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      recordFailedAttempt(email, 'wrong-password');
      const err = new Error('Invalid password');
      console.error('🚨 Invalid login attempt - wrong password:', {
        email,
        timestamp: new Date().toISOString(),
      });
      Sentry.captureException(err, {
        level: 'error',
        extra: { email, reason: 'wrong-password' },
        tags: { area: 'auth', type: 'invalid-login' },
      });
      throw err;
    }

    const accessToken = jwt.generateToken({ id: user.id, email: user.email });
    const refreshToken = jwt.generateRefreshToken({
      id: user.id,
      email: user.email,
    });

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  },

  // TODO: Implement user registration
  register: async (userData) => {
    const { firstName, lastName, email, password } = userData;

    if (!firstName || !lastName || !email || !password) {
      throw new Error('Missing required registration fields');
    }

    let existingUser;
    try {
      existingUser = await prisma.user.findUnique({ where: { email } });
    } catch (err) {
      console.error('🔎 Prisma findUnique error (email check):', {
        message: err.message,
        code: err.code,
        meta: err.meta,
      });
      throw err;
    }
    if (existingUser) {
      throw new Error('Email is already being used for another account');
    }

    let hashPassword;
    try {
      hashPassword = await bcrypt.hash(password, 10);
    } catch (err) {
      console.error('🔐 Password hashing failed:', err);
      throw err;
    }

    let user;
    try {
      user = await prisma.user.create({
        data: { firstName, lastName, email, password: hashPassword },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
      });
    } catch (err) {
      Sentry.captureException(err, {
        level: 'error',
        extra: { email, reason: 'prisma-create-failure' },
        tags: { area: 'auth', type: 'registration-failure' },
      });
      console.error('🛠️ Prisma create user error:', {
        message: err.message,
        code: err.code,
        meta: err.meta,
        stack: err.stack,
      });
      throw err;
    }

    const accessToken = jwt.generateToken({ id: user.id, email: user.email });
    const refreshToken = jwt.generateRefreshToken({
      id: user.id,
      email: user.email,
    });

    return { user, accessToken, refreshToken };
  },

  // TODO: Implement token refresh
  refreshToken: async (refreshToken) => {
    try {
      const payload = jwt.verifyRefreshToken(refreshToken);

      const user = await prisma.user.findUnique({ where: { id: payload.id } });
      if (!user) throw new Error('User not found');

      const accessToken = jwt.generateToken({ id: user.id, email: user.email });
      const newRefreshToken = jwt.generateRefreshToken({
        id: user.id,
        email: user.email,
      });

      //Return Token
      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      Sentry.captureException(error);
      console.error('🚨 Refresh token error:', error);
      throw new Error('Invalid or expired refresh token');
    }
  },

  // TODO: Implement password reset
  resetPassword: async (email) => {
    // Implementation needed
    throw new Error('Not implemented');
  },
};

module.exports = authService;
