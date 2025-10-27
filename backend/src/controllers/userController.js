// TODO: Implement user management controller for profile, settings, statistics
//Partially Complete: updateProfile, getProfile, and deleteAccount logical
const userService = require('../services/userService');
const jwt = require('jsonwebtoken');

const userController = {
  // TODO: Get user profile
  getProfile: async (req, res, next) => {
    try {
      const userId = req.user?.id || req.params.id;
      if (!userId)
        return res.status(400).json({ message: 'User ID is required' });

      const user = await userService.getUserById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  // TODO: Update user profile
  updateProfile: async (req, res, next) => {
    try {
      const userId = req.user?.id || req.params.id;
      const profileData = req.body;

      if (!userId)
        return res.status(400).json({ message: 'User ID is required' });

      const updatedUser = await userService.updateProfile(userId, profileData);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  },

  // TODO: Get user statistics
  getStatistics: async (req, res, next) => {
    // Implementation needed
  },

  // TODO: Delete user account
  deleteAccount: async (req, res, next) => {
    try {
      const userId = req.user?.id || req.params.id;
      if (!userId)
        return res.status(400).json({ message: 'User ID is required' });

      await userService.deleteUser(userId);
      res
        .status(200)
        .json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
