// TODO: Implement authentication controller with login, register, logout, refresh token endpoints
const authService = require('../services/authService');
const bcrypt = require('bcrypt');
const { AppError } = require('../middleware/errorHandler');
const jwt = require('jsonwebtoken');

const authController = {
  // TODO: Add login endpoint
  login: async (req, res, next) => {
    try {
      console.log('📥 Login attempt:', { email: req.body.email });

      const { email, password } = req.body;
      if (!email || !password) {
        console.log('❌ Login failed: Missing email or password');
        return res
          .status(400)
          .json({ success: false, message: 'Email and password are required' });
      }

      const { user, token, refreshToken } = await authService.login(
        email,
        password
      );
      console.log('✅ Login successful for user:', {
        userId: user.id,
        email: user.email,
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict', // or 'Lax' depending on requirements
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { user, token }, // Note: We don't send refreshToken in response body for security
      });
    } catch (error) {
      console.error('❌ Login error:', error);
      return res.status(401).json({
        success: false,
        message: error.message || 'Invalid credentials',
      });
    }
  },

  // TODO: Add register endpoint
  register: async (req, res, next) => {
    try {
      console.log('📥 Incoming registration request body:', req.body);
      const { firstName, lastName, email, password, confirmPassword } =
        req.body;
      console.log('REGISTER BODY:', req.body);
      if (password !== confirmPassword) {
        return res
          .status(400)
          .json({ success: false, message: 'Passwords do not match' });
      }

      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        return res
          .status(400)
          .json({ success: false, message: 'All fields are required' });
      }

      const { user, token, refreshToken } = await authService.register({
        firstName,
        lastName,
        email,
        password,
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user, token, refreshToken },
      });
    } catch (error) {
      next(error);
    }
  },

  // TODO: Add logout endpoint
  logout: async (req, res, next) => {
    try {
      res.clearCookie('refreshToken');
      return res
        .status(200)
        .json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  },

  // TODO: Add refresh token endpoint
  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res
          .status(400)
          .json({ success: false, message: 'Refresh token required' });
      }

      const { token, refreshToken: newRefreshToken } =
        await authService.refreshToken(refreshToken);

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: { token, newRefreshToken },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
