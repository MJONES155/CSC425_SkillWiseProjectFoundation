// TODO: Implement authentication business logic
const jwt = require('../utils/jwt');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authService = {
  // TODO: Implement user login logic
  login: async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('There is no account associated with that email');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid password');
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
