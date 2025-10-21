// TODO: Implement leaderboard routes
const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const auth = require('../middleware/auth');

// TODO: Add GET / route for global leaderboard
router.get('/', auth, leaderboardController.getLeaderboard);

// TODO: Add GET /ranking route for user ranking
router.get('/ranking', auth, leaderboardController.getUserRanking);

// TODO: Add GET /points route for points breakdown
router.get('/points', auth, leaderboardController.getPointsBreakdown);

// TODO: Add GET /achievements route for achievements
router.get('/achievements', auth, leaderboardController.getAchievements);

module.exports = router;