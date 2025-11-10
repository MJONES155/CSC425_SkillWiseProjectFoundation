// TODO: JWT utility functions for token generation and verification
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

module.exports = {
  generateToken: (payload) =>
    jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' }),
  generateRefreshToken: (payload) =>
    jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' }),
  verifyToken: (token) => jwt.verify(token, JWT_SECRET),
  verifyRefreshToken: (token) => jwt.verify(token, REFRESH_SECRET),
};
