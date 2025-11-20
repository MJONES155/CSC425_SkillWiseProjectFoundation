// TODO: Implement challenge routes
const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const auth = require('../middleware/auth');

// TODO: Add GET / route for all challenges
router.get('/', auth, challengeController.getChallenges);

// TODO: Add GET /:id route for single challenge
router.get('/:id', auth, challengeController.getChallengeById);

// TODO: Add POST / route for creating challenge (admin only)
router.post('/', auth, challengeController.createChallenge);

// TODO: Add PUT /:id route for updating challenge (admin only)
router.put('/:id', auth, challengeController.updateChallenge);

// TODO: Add DELETE /:id route for deleting challenge (admin only)
router.delete('/:id', auth, challengeController.deleteChallenge);

module.exports = router;
