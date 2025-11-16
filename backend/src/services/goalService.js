// TODO: Implement goal business logic and calculations
const Goal = require('../models/Goal');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const goalService = {
  // TODO: Get user goals with progress
  getUserGoals: async (userId, filters) => {
    return await prisma.goals.findMany({
      where: { userId: parseInt(userId), ...filters },
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
      orderBy: { createdAt: 'desc' },
    });
  },

  // Get single goal by id for user
  getGoalById: async (goalId, userId) => {
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
        difficulty: difficulty ?? 'medium',
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

  // Update goal for user
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

  deleteGoal: async (goalId, userId) => {
    const res = await prisma.goals.deleteMany({
      where: { id: parseInt(goalId), userId: parseInt(userId) },
    });
    return res.count;
  },

  updateProgress: async (goalId, progress) => {
    // Implementation needed
    throw new Error('Not implemented');
  },

  // TODO: Calculate goal completion percentage
  calculateCompletion: (goal) => {
    // Implementation needed
    return 0;
  },
};

module.exports = goalService;
