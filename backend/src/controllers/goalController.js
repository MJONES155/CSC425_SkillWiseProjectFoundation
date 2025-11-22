// TODO: Implement goals CRUD operations controller
const goalService = require('../services/goalService');
const { AppError } = require('../middleware/errorHandler');

const goalController = {
  // TODO: Get all goals for user
  getGoals: async (req, res, next) => {
    const userId = req.user.id;
    try {
      const goals = await goalService.getUserGoals(userId);
      res.status(200).json({ success: true, data: goals });
    } catch (error) {
      next(error);
    }
  },

  // TODO: Get single goal by ID
  getGoalById: async (req, res, next) => {
    try {
      const goalId = req.params.id;
      const userId = req.user.id;
      if (!goalId) {
        return res.status(400).json({ message: 'Goal ID is required' });
      }
      const goal = await goalService.getGoalById(goalId, userId);
      if (!goal) {
        return res
          .status(404)
          .json({ success: false, message: 'Goal not found' });
      } else {
        res.status(200).json({ success: true, data: goal });
      }
    } catch (error) {
      next(error);
    }
  },

  // TODO: Create new goal
  createGoal: async (req, res, next) => {
    try {
      console.log('📥 Incoming create goal request body:', req.body);
      const userId = req.user.id;
      const goalData = req.body;
      const goal = await goalService.createGoal(goalData, userId);

      console.log('✅ Goal created successfully:', goal);
      res.status(201).json({
        success: true,
        data: goal,
      });
    } catch (error) {
      next(error);
    }
  },

  // TODO: Update existing goal
  updateGoal: async (req, res, next) => {
    try {
      const goalId = req.params.id;
      const userId = req.user.id;
      if (!goalId) {
        return res.status(400).json({ message: 'Goal ID is required' });
      }
      const updatedGoal = await goalService.updateGoal(
        goalId,
        userId,
        req.body,
      );
      if (!updatedGoal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found or not owned by user',
        });
      } else {
        res.status(200).json({ success: true, data: updatedGoal });
      }
    } catch (error) {
      next(error);
    }
  },

  // TODO: Delete goal
  deleteGoal: async (req, res, next) => {
    try {
      const goalId = req.params.id;
      const userId = req.user.id;
      if (!goalId) {
        return res.status(400).json({ message: 'Goal ID is required' });
      }
      const deletedCount = await goalService.deleteGoal(goalId, userId);
      if (!deletedCount) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found or not owned by user',
        });
      } else {
        res
          .status(200)
          .json({ success: true, message: 'Goal deleted successfully' });
      }
    } catch (error) {
      next(error);
    }
  },
};

module.exports = goalController;
