// TODO: Implement goal business logic and calculations
const Goal = require('../models/Goal');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const goalService = {
  // Get user goals with progress (recalculates if stale)
  getUserGoals: async (userId, filters = {}) => {
    const goals = await prisma.goals.findMany({
      where: { userId: parseInt(userId), ...filters },
      orderBy: { createdAt: 'desc' },
    });

    // Recalculate progress for each goal based on tagged challenges
    const enriched = [];
    for (const goal of goals) {
      const progress = await goalService.calculateCompletion(goal.id, userId);
      enriched.push({
        ...goal,
        progressPercentage: progress.percentage,
        isCompleted: progress.isCompleted,
      });
    }
    return enriched;
  },

  // Get single goal by id for user (with dynamic progress)
  getGoalById: async (goalId, userId) => {
    const goal = await prisma.goals.findFirst({
      where: { id: parseInt(goalId), userId: parseInt(userId) },
    });
    if (!goal) return null;
    const progress = await goalService.calculateCompletion(goal.id, userId);
    return {
      ...goal,
      progressPercentage: progress.percentage,
      isCompleted: progress.isCompleted,
    };
  },

  // TODO: Create new goal with validation
  createGoal: async (goalData, userId) => {
    const {
      title,
      description,
      category,
      difficulty,
      targetCompletionDate,
      isPublic,
      pointsReward,
    } = goalData;

    if (!title) throw new Error('Title is required');

    const goal = await prisma.goals.create({
      data: {
        userId: parseInt(userId),
        title,
        description: description ?? null,
        category: category ?? null,
        difficulty: difficulty ?? 'Medium',
        targetCompletionDate: targetCompletionDate
          ? new Date(targetCompletionDate)
          : null,
        isPublic: Boolean(isPublic) || false,
        pointsReward: pointsReward ?? 0,
      },
      select: {
        id: true,
        userId: true,
        title: true,
        description: true,
        category: true,
        difficulty: true,
        targetCompletionDate: true,
        isCompleted: true,
        progressPercentage: true,
        pointsReward: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return goal;
  },

  // Update goal for user (supports marking completed / paused via difficulty workaround)
  updateGoal: async (goalId, userId, updateData) => {
    const data = {};
    const allowed = [
      'title',
      'description',
      'category',
      'difficulty',
      'targetCompletionDate',
      'isCompleted',
      'progressPercentage',
      'pointsReward',
      'isPublic',
    ];
    for (const key of allowed) {
      if (updateData[key] !== undefined) {
        data[key] =
          key === 'targetCompletionDate' && updateData[key]
            ? new Date(updateData[key])
            : updateData[key];
      }
    }

    await prisma.goals.updateMany({
      where: { id: parseInt(goalId), userId: parseInt(userId) },
      data,
    });

    return await prisma.goals.findFirst({
      where: { id: parseInt(goalId), userId: parseInt(userId) },
      select: {
        id: true,
        userId: true,
        title: true,
        description: true,
        category: true,
        difficulty: true,
        targetCompletionDate: true,
        isCompleted: true,
        progressPercentage: true,
        pointsReward: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // Delete goal (manual cascade for progress events referencing this goal)
  deleteGoal: async (goalId, userId) => {
    const id = parseInt(goalId);
    const uid = parseInt(userId);

    const [deletedEvents, deletedGoals] = await prisma.$transaction([
      prisma.progress_events.deleteMany({ where: { relatedGoalId: id } }),
      prisma.goals.deleteMany({ where: { id, userId: uid } }),
    ]);

    return deletedGoals.count;
  },

  // Explicitly update goal progress (caps & completion handling)
  updateProgress: async (goalId, userId, progressValue) => {
    const pct = Math.min(100, Math.max(0, parseInt(progressValue)));
    const isCompleted = pct === 100;
    await prisma.goals.updateMany({
      where: { id: parseInt(goalId), userId: parseInt(userId) },
      data: {
        progressPercentage: pct,
        isCompleted,
        completionDate: isCompleted ? new Date() : null,
      },
    });
    return goalService.getGoalById(goalId, userId);
  },

  // Recalculate goal progress based on tagged challenges and completion events
  calculateCompletion: async (goalId, userId) => {
    const tagValue = `goal:${goalId}`;
    // All challenges created by user tagged for this goal
    const challenges = await prisma.challenges.findMany({
      where: { createdBy: parseInt(userId), tags: { has: tagValue } },
      select: { id: true, pointsReward: true },
    });
    const total = challenges.length;
    if (total === 0) {
      // Ensure stored progress is 0
      await prisma.goals.updateMany({
        where: { id: parseInt(goalId), userId: parseInt(userId) },
        data: { progressPercentage: 0, isCompleted: false },
      });
      return { percentage: 0, isCompleted: false };
    }
    const challengeIds = challenges.map((c) => c.id);
    const completionEvents = await prisma.progress_events.findMany({
      where: {
        relatedGoalId: parseInt(goalId),
        relatedChallengeId: { in: challengeIds },
        eventType: 'challenge_completed',
      },
      select: { id: true },
    });
    const completed = completionEvents.length;
    const percentage = Math.round((completed / total) * 100);
    const isCompleted = percentage === 100;
    await prisma.goals.updateMany({
      where: { id: parseInt(goalId), userId: parseInt(userId) },
      data: {
        progressPercentage: percentage,
        isCompleted,
        completionDate: isCompleted ? new Date() : null,
      },
    });
    return { percentage, isCompleted };
  },
};

module.exports = goalService;
