// TODO: Implement user routes
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// TODO: Add GET /profile route
router.get('/profile', auth, userController.getProfile);

// TODO: Add PUT /profile route
router.put('/profile', auth, userController.updateProfile);

// TODO: Add GET /statistics route
router.get('/statistics', auth, userController.getStatistics);

// TODO: Add DELETE /account route
router.delete('/account', auth, userController.deleteAccount);

module.exports = router;
