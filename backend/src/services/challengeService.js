// TODO: Implement challenge business logic
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const challengeService = {
  // Get all challenges for a user (challenges they created)
  getUserChallenges: async (userId, filters = {}) => {
    const where = { createdBy: parseInt(userId) };

    // Add optional filters
    if (filters.category) where.category = filters.category;
    if (filters.difficulty) where.difficulty = filters.difficulty;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;

    return await prisma.challenges.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        instructions: true,
        category: true,
        difficulty: true,
        estimatedTimeMinutes: true,
        pointsReward: true,
        maxAttempts: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Get a single challenge by ID (must be created by user)
  getChallengeById: async (challengeId, userId) => {
    return await prisma.challenges.findFirst({
      where: {
        id: parseInt(challengeId),
        createdBy: parseInt(userId),
      },
      select: {
        id: true,
        title: true,
        description: true,
        instructions: true,
        category: true,
        difficulty: true,
        estimatedTimeMinutes: true,
        pointsReward: true,
        maxAttempts: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // Create a new challenge
  createChallenge: async (challengeData, userId) => {
    const {
      title,
      description,
      instructions,
      category,
      difficulty,
      estimatedTimeMinutes,
      pointsReward,
      maxAttempts,
    } = challengeData;

    if (!title || !description || !instructions) {
      throw new Error('Title, description, and instructions are required');
    }

    const challenge = await prisma.challenges.create({
      data: {
        title,
        description,
        instructions,
        category: category || null,
        difficulty: difficulty || 'medium',
        estimatedTimeMinutes: estimatedTimeMinutes || null,
        pointsReward: pointsReward || 10,
        maxAttempts: maxAttempts || 3,
        requiresPeerReview: false,
        isActive: true,
        createdBy: parseInt(userId),
        tags: [],
        prerequisites: [],
        learningObjectives: [],
      },
      select: {
        id: true,
        title: true,
        description: true,
        instructions: true,
        category: true,
        difficulty: true,
        estimatedTimeMinutes: true,
        pointsReward: true,
        maxAttempts: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return challenge;
  },

  // Update an existing challenge
  updateChallenge: async (challengeId, userId, updateData) => {
    const data = {};
    const allowed = [
      'title',
      'description',
      'instructions',
      'category',
      'difficulty',
      'estimatedTimeMinutes',
      'pointsReward',
      'maxAttempts',
    ];

    for (const key of allowed) {
      if (updateData[key] !== undefined) {
        data[key] = updateData[key];
      }
    }

    await prisma.challenges.updateMany({
      where: {
        id: parseInt(challengeId),
        createdBy: parseInt(userId),
      },
      data,
    });

    return await prisma.challenges.findFirst({
      where: {
        id: parseInt(challengeId),
        createdBy: parseInt(userId),
      },
      select: {
        id: true,
        title: true,
        description: true,
        instructions: true,
        category: true,
        difficulty: true,
        estimatedTimeMinutes: true,
        pointsReward: true,
        maxAttempts: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // Delete a challenge
  deleteChallenge: async (challengeId, userId) => {
    const res = await prisma.challenges.deleteMany({
      where: {
        id: parseInt(challengeId),
        createdBy: parseInt(userId),
      },
    });
    return res.count;
  },

  // TODO: Generate personalized challenges using AI
  generatePersonalizedChallenges: async (userId) => {
    // Will be implemented with AI integration
    throw new Error('Not implemented - AI generation coming soon');
  },

  // TODO: Validate challenge completion
  validateCompletion: async (challengeId, submissionData) => {
    // Implementation needed
    throw new Error('Not implemented');
  },

  // TODO: Calculate challenge difficulty
  calculateDifficulty: (challenge) => {
    // Implementation needed
    return 'medium';
  },
};

module.exports = challengeService;
