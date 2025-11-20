// Progress routes
const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const auth = require('../middleware/auth');

// Legacy overview
router.get('/', auth, progressController.getProgress);

// Overview matching frontend apiService
router.get('/overview', auth, progressController.getOverview);

// Recent activity timeline
router.get('/activity', auth, progressController.getActivity);

// Analytics & stats
router.get('/analytics', auth, progressController.getAnalytics);
router.get('/stats', auth, progressController.getAnalytics);

// Skills/category breakdown
router.get('/skills', auth, progressController.getSkills);

// Milestones
router.get('/milestones', auth, progressController.getMilestones);

// Track an event
router.post('/event', auth, progressController.updateProgress);

module.exports = router;
