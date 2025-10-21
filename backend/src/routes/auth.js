// TODO: Implement authentication routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validation = require('../middleware/validation');

// TODO: Add POST /login route
router.post('/login', validation.loginValidation, authController.login);

// TODO: Add POST /register route
router.post('/register', validation.registerValidation, authController.register);

// TODO: Add POST /logout route
router.post('/logout', authController.logout);

// TODO: Add POST /refresh route
router.post('/refresh', authController.refreshToken);

// TODO: Add POST /forgot-password route
// router.post('/forgot-password', authController.forgotPassword);

// TODO: Add POST /reset-password route
// router.post('/reset-password', authController.resetPassword);

module.exports = router;