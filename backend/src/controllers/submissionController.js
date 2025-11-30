// TODO: Implement work submission controller
const submissionService = require('../services/submissionService');
const aiController = require('../controllers/aiController'); // allow chaining

const submissionController = {
  // TODO: Submit work for challenge
  submitWork: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { challengeId, content } = req.body;

      const submission = await submissionService.submitSolution(
        userId,
        parseInt(challengeId),
        content
      );

      // call AI feedback
      req.body.submissionId = submission.id;
      req.body.content = content;
      req.body.challengeId = challengeId;

      return aiController.generateFeedback(req, res);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: 'Failed to submit work', error: err.message });
    }
  },

  // TODO: Get submission by ID
  getSubmission: async (req, res, next) => {
    try {
      const submissionId = req.params.id;
      const submission = await submissionService.getSubmissionById(
        submissionId
      );
      res.status(200).json({ success: true, data: submission });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: 'Failed to get submission', error: err.message });
    }
  },

  // TODO: Get user submissions
  getUserSubmissions: async (req, res, next) => {
    const userId = req.user.id;
    try {
      const submissions = await submissionService.getUserSubmissions(userId);
      res.status(200).json({ success: true, data: submissions });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({
          message: 'Failed to get user submissions',
          error: err.message,
        });
    }
  },

  // Get user's submissions for a specific challenge with feedback
  getUserChallengeSubmissions: async (req, res, next) => {
    const userId = req.user.id;
    const { challengeId } = req.params;
    try {
      const submissions = await submissionService.getUserChallengeSubmissions(
        userId,
        challengeId
      );
      res.status(200).json({ success: true, data: submissions });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({
          message: 'Failed to get challenge submissions',
          error: err.message,
        });
    }
  },

  // TODO: Update submission
  updateSubmission: async (req, res, next) => {
    try {
      const submissionId = req.params.id;
      const { status } = req.body;
      const updated = await submissionService.updateSubmissionStatus(
        submissionId,
        status
      );
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: 'Failed to update submission', error: err.message });
    }
  },
};

module.exports = submissionController;
