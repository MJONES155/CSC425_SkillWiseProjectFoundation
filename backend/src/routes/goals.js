// TODO: Implement goal routes
const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const auth = require('../middleware/auth');

// TODO: Add GET / route for user goals
router.get('/', auth, goalController.getGoals);

// TODO: Add GET /:id route for single goal
router.get('/:id', auth, goalController.getGoalById);

// TODO: Add POST / route for creating goal
router.post('/', auth, goalController.createGoal);

// TODO: Add PUT /:id route for updating goal
router.put('/:id', auth, goalController.updateGoal);

// TODO: Add DELETE /:id route for deleting goal
router.delete('/:id', auth, goalController.deleteGoal);

module.exports = router;