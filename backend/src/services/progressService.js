// Progress tracking and analytics service using Prisma and progress_events
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const progressService = {
  // Calculate overall user progress summary
  calculateOverallProgress: async (userId) => {
    const uid = parseInt(userId);

    // Goals summary with dynamic progress
    const goals = await prisma.goals.findMany({
      where: { userId: uid },
      select: {
        id: true,
        title: true,
        isCompleted: true,
        progressPercentage: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const goalsCompleted = goals.filter((g) => g.isCompleted).length;
    const avgProgress = goals.length
      ? Math.round(
        goals.reduce((sum, g) => sum + (g.progressPercentage || 0), 0) /
            goals.length,
      )
      : 0;

    // Events summary
    const [pointsAgg, challengeCompletedCount] = await Promise.all([
      prisma.progress_events.aggregate({
        _sum: { pointsEarned: true },
        where: { userId: uid },
      }),
      prisma.progress_events.count({
        where: { userId: uid, eventType: 'challenge_completed' },
      }),
    ]);

    const totalPoints = pointsAgg._sum.pointsEarned || 0;

    // Streaks based on event days
    const events = await prisma.progress_events.findMany({
      where: { userId: uid },
      select: { timestampOccurred: true },
      orderBy: { timestampOccurred: 'desc' },
    });

    const datesSet = new Set(
      events
        .filter((e) => e.timestampOccurred)
        .map((e) => e.timestampOccurred.toISOString().slice(0, 10)),
    );

    const today = new Date();
    const dateKey = (d) => d.toISOString().slice(0, 10);

    // Current streak
    let curr = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    );
    let currentStreak = 0;
    while (datesSet.has(dateKey(curr))) {
      currentStreak++;
      curr = new Date(curr.getTime() - 24 * 60 * 60 * 1000);
    }

    // Longest streak
    const allDates = Array.from(datesSet).sort();
    let longestStreak = 0;
    let streak = 0;
    let prev = null;
    for (const ds of allDates) {
      const d = new Date(ds + 'T00:00:00Z');
      if (prev && d.getTime() - prev.getTime() === 24 * 60 * 60 * 1000) {
        streak += 1;
      } else {
        streak = 1;
      }
      longestStreak = Math.max(longestStreak, streak);
      prev = d;
    }

    return {
      overallProgressPercentage: avgProgress,
      totals: {
        totalPoints,
        completedChallenges: challengeCompletedCount,
        completedGoals: goalsCompleted,
        currentStreakDays: currentStreak,
        longestStreakDays: longestStreak,
      },
      goals: goals.map((g) => ({
        id: g.id,
        title: g.title,
        progressPercentage: g.progressPercentage || 0,
        isCompleted: !!g.isCompleted,
      })),
    };
  },

  // Track learning events
  trackEvent: async (userId, eventType, eventData = {}) => {
    const uid = parseInt(userId);
    const {
      relatedGoalId = null,
      relatedChallengeId = null,
      relatedSubmissionId = null,
      pointsEarned = 0,
      sessionId = null,
      eventData: payload = null,
      timestamp = null,
    } = eventData || {};

    const created = await prisma.progress_events.create({
      data: {
        userId: uid,
        eventType,
        eventData: payload,
        pointsEarned: pointsEarned || 0,
        relatedGoalId: relatedGoalId ? parseInt(relatedGoalId) : null,
        relatedChallengeId: relatedChallengeId
          ? parseInt(relatedChallengeId)
          : null,
        relatedSubmissionId: relatedSubmissionId
          ? parseInt(relatedSubmissionId)
          : null,
        sessionId,
        timestampOccurred: timestamp ? new Date(timestamp) : new Date(),
      },
    });

    return created;
  },

  // Generate progress analytics (daily buckets and type breakdown)
  generateAnalytics: async (userId, timeframe = '7d') => {
    const uid = parseInt(userId);
    const now = new Date();
    const days = timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 7;
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const events = await prisma.progress_events.findMany({
      where: { userId: uid, timestampOccurred: { gte: start } },
      select: { timestampOccurred: true, eventType: true, pointsEarned: true },
      orderBy: { timestampOccurred: 'asc' },
    });

    // Initialize buckets for each day
    const buckets = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = { date: key, events: 0, points: 0 };
    }

    const typeBreakdown = {};
    for (const ev of events) {
      const key = ev.timestampOccurred.toISOString().slice(0, 10);
      if (buckets[key]) {
        buckets[key].events += 1;
        buckets[key].points += ev.pointsEarned || 0;
      }
      typeBreakdown[ev.eventType] = (typeBreakdown[ev.eventType] || 0) + 1;
    }

    return {
      timeframe: days,
      daily: Object.values(buckets),
      breakdown: typeBreakdown,
      totals: {
        events: events.length,
        points: events.reduce((s, e) => s + (e.pointsEarned || 0), 0),
      },
    };
  },

  // Recent activity timeline (enriched)
  getActivity: async (userId, { limit = 20, since = null } = {}) => {
    const uid = parseInt(userId);
    const where = { userId: uid };
    if (since) where.timestampOccurred = { gte: new Date(since) };

    const events = await prisma.progress_events.findMany({
      where,
      orderBy: { timestampOccurred: 'desc' },
      take: Math.min(parseInt(limit) || 20, 100),
      select: {
        id: true,
        eventType: true,
        eventData: true,
        pointsEarned: true,
        relatedGoalId: true,
        relatedChallengeId: true,
        timestampOccurred: true,
      },
    });

    // Enrich with titles
    const goalIds = Array.from(
      new Set(events.map((e) => e.relatedGoalId).filter(Boolean)),
    );
    const challengeIds = Array.from(
      new Set(events.map((e) => e.relatedChallengeId).filter(Boolean)),
    );

    const [goals, challenges] = await Promise.all([
      goalIds.length
        ? prisma.goals.findMany({
          where: { id: { in: goalIds } },
          select: { id: true, title: true },
        })
        : Promise.resolve([]),
      challengeIds.length
        ? prisma.challenges.findMany({
          where: { id: { in: challengeIds } },
          select: { id: true, title: true, category: true },
        })
        : Promise.resolve([]),
    ]);

    const goalMap = new Map(goals.map((g) => [g.id, g.title]));
    const chMap = new Map(challenges.map((c) => [c.id, c]));

    return events.map((e) => ({
      id: e.id,
      type: e.eventType,
      points: e.pointsEarned || 0,
      timestamp: e.timestampOccurred,
      goalId: e.relatedGoalId || null,
      goalTitle: e.relatedGoalId ? goalMap.get(e.relatedGoalId) || null : null,
      challengeId: e.relatedChallengeId || null,
      challengeTitle: e.relatedChallengeId
        ? chMap.get(e.relatedChallengeId)?.title || null
        : null,
      category: e.relatedChallengeId
        ? chMap.get(e.relatedChallengeId)?.category || null
        : null,
      data: e.eventData || null,
    }));
  },

  // Skill/category breakdown from completed challenges
  getSkills: async (userId, { timeframe = '30d' } = {}) => {
    const uid = parseInt(userId);
    const now = new Date();
    const days = timeframe === '7d' ? 7 : timeframe === '90d' ? 90 : 30;
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const events = await prisma.progress_events.findMany({
      where: {
        userId: uid,
        eventType: 'challenge_completed',
        timestampOccurred: { gte: start },
      },
      select: { relatedChallengeId: true },
    });
    const challengeIds = Array.from(
      new Set(events.map((e) => e.relatedChallengeId).filter(Boolean)),
    );
    if (!challengeIds.length) return [];
    const challenges = await prisma.challenges.findMany({
      where: { id: { in: challengeIds } },
      select: { id: true, category: true },
    });
    const counts = {};
    for (const ch of challenges) {
      const key = ch.category || 'General';
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts).map(([category, completed]) => ({
      category,
      completed,
    }));
  },

  // Check simple milestones (progress-based)
  checkMilestones: async (userId) => {
    const uid = parseInt(userId);
    const challengesCompleted = await prisma.progress_events.count({
      where: { userId: uid, eventType: 'challenge_completed' },
    });
    const goalsCompleted = await prisma.goals.count({
      where: { userId: uid, isCompleted: true },
    });

    const milestones = [
      {
        key: 'first_challenge',
        title: 'First Challenge!',
        achieved: challengesCompleted >= 1,
      },
      {
        key: 'five_challenges',
        title: '5 Challenges Completed',
        achieved: challengesCompleted >= 5,
      },
      {
        key: 'first_goal',
        title: 'First Goal Completed',
        achieved: goalsCompleted >= 1,
      },
      {
        key: 'ten_goals',
        title: '10 Goals Completed',
        achieved: goalsCompleted >= 10,
      },
    ];
    return milestones;
  },
};

module.exports = progressService;
