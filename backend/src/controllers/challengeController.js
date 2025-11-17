// TODO: Implement challenges CRUD operations controller
const challengeService = require('../services/challengeService');
const { AppError } = require('../middleware/errorHandler');

const challengeController = {
  // TODO: Get all challenges
  getChallenges: async (req, res, next) => {
    const userId = req.user.id;
    try {
      const challenges = await challengeService.getUserChallenges(userId);
      res.status(200).json({ success: true, data: challenges });
    } catch (error) {
      next(error);
    }
  },

  // TODO: Get challenge by ID
  getChallengeById: async (req, res, next) => {
    try {
      const challengeId = req.params.id;
      const userId = req.user.id;
      if (!challengeId) {
        return res.status(400).json({ message: 'Challenge ID is required' });
      }
      const challenge = await challengeService.getChallengeById(
        challengeId,
        userId
      );
      if (!challenge) {
        return res
          .status(404)
          .json({ success: false, message: 'Challenge not found' });
      } else {
        res.status(200).json({ success: true, data: challenge });
      }
    } catch (error) {
      next(error);
    }
  },

  // TODO: Create new challenge
  createChallenge: async (req, res, next) => {
    try {
      console.log('📥 Incoming create challenge request body:', req.body);
      const userId = req.user.id;
      const challengeData = req.body;
      const challenge = await challengeService.createChallenge(
        challengeData,
        userId
      );

      console.log('✅ Challenge created successfully:', challenge);
      res.status(201).json({ success: true, data: challenge });
    } catch (error) {
      next(error);
    }
  },

  // TODO: Update challenge
  updateChallenge: async (req, res, next) => {
    try {
      const challengeId = req.params.id;
      const userId = req.user.id;
      if (!challengeId) {
        return res.status(400).json({ message: 'Challenge ID is required' });
      }
      const updatedChallenge = await challengeService.updateChallenge(
        challengeId,
        userId,
        req.body
      );
      if (!updatedChallenge) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found or not owned by user',
        });
      } else {
        res.status(200).json({ success: true, data: updatedChallenge });
      }
    } catch (error) {
      next(error);
    }
  },

  // TODO: Delete challenge
  deleteChallenge: async (req, res, next) => {
    try {
      const challengeId = req.params.id;
      const userId = req.user.id;
      if (!challengeId) {
        return res.status(400).json({ message: 'Challenge ID is required' });
      }
      const deletedCount = await challengeService.deleteChallenge(
        challengeId,
        userId
      );
      if (!deletedCount) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found or not owned by user',
        });
      } else {
        res
          .status(200)
          .json({ success: true, message: 'Challenge deleted successfully' });
      }
    } catch (error) {
      next(error);
    }
  },

  // Mark challenge as completed
  completeChallenge: async (req, res, next) => {
    try {
      const challengeId = req.params.id;
      const userId = req.user.id;
      if (!challengeId) {
        return res.status(400).json({ message: 'Challenge ID is required' });
      }
      const updated = await challengeService.completeChallenge(
        challengeId,
        userId
      );
      res.status(200).json({
        success: true,
        data: updated,
        message: 'Challenge marked as completed',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = challengeController;
