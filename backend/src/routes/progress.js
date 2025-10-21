// TODO: Implement progress routes
const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const auth = require('../middleware/auth');

// TODO: Add GET / route for user progress
router.get('/', auth, progressController.getProgress);

// TODO: Add POST /event route for tracking progress events
router.post('/event', auth, progressController.updateProgress);

// TODO: Add GET /analytics route for progress analytics
router.get('/analytics', auth, progressController.getAnalytics);

// TODO: Add GET /milestones route for milestone tracking
router.get('/milestones', auth, progressController.getMilestones);

module.exports = router;