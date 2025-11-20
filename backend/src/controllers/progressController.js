// Progress tracking controller
const progressService = require('../services/progressService');

const ok = (res, data, message = 'ok') =>
  res.status(200).json({ success: true, message, data });
const created = (res, data, message = 'created') =>
  res.status(201).json({ success: true, message, data });
const handleErr = (next, err) => next(err);

const progressController = {
  // GET /api/progress (legacy overview)
  getProgress: async (req, res, next) => {
    try {
      const userId = req.user?.id || req.userId || req.user?.userId;
      const summary = await progressService.calculateOverallProgress(userId);
      const activity = await progressService.getActivity(userId, {
        limit: 10,
      });
      return ok(res, { summary, recentActivity: activity }, 'progress');
    } catch (err) {
      return handleErr(next, err);
    }
  },

  // GET /api/progress/overview
  getOverview: async (req, res, next) => {
    try {
      const userId = req.user?.id || req.userId || req.user?.userId;
      const summary = await progressService.calculateOverallProgress(userId);
      return ok(res, summary, 'overview');
    } catch (err) {
      return handleErr(next, err);
    }
  },

  // GET /api/progress/activity
  getActivity: async (req, res, next) => {
    try {
      const userId = req.user?.id || req.userId || req.user?.userId;
      const { limit, since } = req.query;
      const activity = await progressService.getActivity(userId, {
        limit,
        since,
      });
      return ok(res, activity, 'activity');
    } catch (err) {
      return handleErr(next, err);
    }
  },

  // POST /api/progress/event
  updateProgress: async (req, res, next) => {
    try {
      const userId = req.user?.id || req.userId || req.user?.userId;
      const { eventType, ...eventData } = req.body || {};
      if (!eventType) {
        return res
          .status(400)
          .json({ success: false, message: 'eventType is required' });
      }
      const event = await progressService.trackEvent(
        userId,
        eventType,
        eventData
      );
      return created(res, event, 'event_tracked');
    } catch (err) {
      return handleErr(next, err);
    }
  },

  // GET /api/progress/analytics and /stats
  getAnalytics: async (req, res, next) => {
    try {
      const userId = req.user?.id || req.userId || req.user?.userId;
      const { timeframe } = req.query;
      const analytics = await progressService.generateAnalytics(
        userId,
        timeframe
      );
      return ok(res, analytics, 'analytics');
    } catch (err) {
      return handleErr(next, err);
    }
  },

  // GET /api/progress/milestones
  getMilestones: async (req, res, next) => {
    try {
      const userId = req.user?.id || req.userId || req.user?.userId;
      const milestones = await progressService.checkMilestones(userId);
      return ok(res, milestones, 'milestones');
    } catch (err) {
      return handleErr(next, err);
    }
  },

  // GET /api/progress/skills
  getSkills: async (req, res, next) => {
    try {
      const userId = req.user?.id || req.userId || req.user?.userId;
      const { timeframe } = req.query;
      const skills = await progressService.getSkills(userId, { timeframe });
      return ok(res, skills, 'skills');
    } catch (err) {
      return handleErr(next, err);
    }
  },
};

module.exports = progressController;
