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

    const token = jwt.generateToken({ id: user.id, email: user.email });
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
      token,
      refreshToken,
    };
  },

  // TODO: Implement user registration
  register: async (userData) => {
    const { firstName, lastName, email, password } = userData;
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new Error('Email is already being used for another account');
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashPassword,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
    });
    const token = jwt.generateToken({ id: newUser.id, email: newUser.email });
    const refreshToken = jwt.generateRefreshToken({
      id: newUser.id,
      email: newUser.email,
    });

    return { user: newUser, token, refreshToken };
  },

  // TODO: Implement token refresh
  refreshToken: async (refreshToken) => {
    try {
      // Use the refreshToken value passed in by the controller (from body or cookie)
      const tokenFromCookie = refreshToken;
      if (!tokenFromCookie) throw new Error('No refresh token provided');

      const payload = jwt.verifyRefreshToken(tokenFromCookie);

      const user = await prisma.user.findUnique({ where: { id: payload.id } });
      if (!user) throw new Error('User not found');

      const token = jwt.generateToken({ id: user.id, email: user.email });
      const newRefreshToken = jwt.generateRefreshToken({
        id: user.id,
        email: user.email,
      });

      //Return Token
      return { token, refreshToken: newRefreshToken };
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
