// TODO: Implement challenge business logic
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const challengeService = {
  // Get all challenges for a user (supports goal filtering via tag goal:<id>)
  getUserChallenges: async (userId, filters = {}) => {
    const where = { createdBy: parseInt(userId) };

    if (filters.category) where.category = filters.category;
    if (filters.difficulty) where.difficulty = filters.difficulty;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.goalId) {
      where.tags = { has: `goal:${filters.goalId}` };
    }

    const raw = await prisma.challenges.findMany({
      where,
      include: {
        progress_events: { select: { eventType: true, relatedGoalId: true } },
        submissions: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return raw.map((ch) => {
      const goalTag = ch.tags?.find((t) => t.startsWith('goal:'));
      const linkedGoalId = goalTag ? parseInt(goalTag.split(':')[1]) : null;
      const isCompleted = ch.progress_events.some(
        (ev) => ev.eventType === 'challenge_completed',
      );
      const hasSubmissions = ch.submissions.length > 0;
      const status = isCompleted
        ? 'completed'
        : hasSubmissions
          ? 'in_progress'
          : 'todo';
      return {
        id: ch.id,
        title: ch.title,
        description: ch.description,
        instructions: ch.instructions,
        category: ch.category,
        difficulty: ch.difficulty,
        estimatedTimeMinutes: ch.estimatedTimeMinutes,
        pointsReward: ch.pointsReward,
        maxAttempts: ch.maxAttempts,
        createdBy: ch.createdBy,
        createdAt: ch.createdAt,
        updatedAt: ch.updatedAt,
        goalId: linkedGoalId,
        status,
        prerequisites: ch.prerequisites || [],
      };
    });
  },

  // Get a single challenge by ID (with status & goal link)
  getChallengeById: async (challengeId, userId) => {
    const ch = await prisma.challenges.findFirst({
      where: { id: parseInt(challengeId), createdBy: parseInt(userId) },
      include: {
        progress_events: { select: { eventType: true, relatedGoalId: true } },
        submissions: { select: { id: true } },
      },
    });
    if (!ch) return null;
    const goalTag = ch.tags?.find((t) => t.startsWith('goal:'));
    const linkedGoalId = goalTag ? parseInt(goalTag.split(':')[1]) : null;
    const isCompleted = ch.progress_events.some(
      (ev) => ev.eventType === 'challenge_completed',
    );
    const hasSubmissions = ch.submissions.length > 0;
    const status = isCompleted
      ? 'completed'
      : hasSubmissions
        ? 'in_progress'
        : 'todo';
    return {
      id: ch.id,
      title: ch.title,
      description: ch.description,
      instructions: ch.instructions,
      category: ch.category,
      difficulty: ch.difficulty,
      estimatedTimeMinutes: ch.estimatedTimeMinutes,
      pointsReward: ch.pointsReward,
      maxAttempts: ch.maxAttempts,
      createdBy: ch.createdBy,
      createdAt: ch.createdAt,
      updatedAt: ch.updatedAt,
      goalId: linkedGoalId,
      status,
      prerequisites: ch.prerequisites || [],
    };
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
      goalId, // optional linkage via tag
      prerequisites = [], // array of challenge IDs required before this one
    } = challengeData;

    if (!title || !description || !instructions) {
      throw new Error('Title, description, and instructions are required');
    }

    const tags = [];
    if (goalId) {
      const goal = await prisma.goals.findFirst({
        where: { id: parseInt(goalId), userId: parseInt(userId) },
        select: { id: true },
      });
      if (!goal) {
        throw new Error('Linked goal not found or not owned by user');
      }
      tags.push(`goal:${parseInt(goalId)}`);
    }

    // Validate prerequisites exist and belong to user
    const prereqIds = (prerequisites || [])
      .map((id) => parseInt(id))
      .filter((n) => Number.isInteger(n) && n > 0);
    if (prereqIds.length) {
      const found = await prisma.challenges.findMany({
        where: { id: { in: prereqIds }, createdBy: parseInt(userId) },
        select: { id: true, tags: true },
      });
      const foundIds = new Set(found.map((c) => c.id));
      const missing = prereqIds.filter((id) => !foundIds.has(id));
      if (missing.length) {
        throw new Error(
          `Prerequisite challenge(s) not found or not owned: ${missing.join(
            ', ',
          )}`,
        );
      }
      // If linking to a goal, ensure prereqs belong to same goal for coherence
      if (goalId) {
        const requiredTag = `goal:${parseInt(goalId)}`;
        const crossGoal = found
          .filter((c) => !(c.tags || []).includes(requiredTag))
          .map((c) => c.id);
        if (crossGoal.length) {
          throw new Error(
            `Prerequisite challenge(s) must be in the same goal (${goalId}): ${crossGoal.join(
              ', ',
            )}`,
          );
        }
      }
    }

    const challenge = await prisma.challenges.create({
      data: {
        title,
        description,
        instructions,
        category: category || null,
        difficulty: difficulty || 'Medium',
        estimatedTimeMinutes: estimatedTimeMinutes || null,
        pointsReward: pointsReward || 10,
        maxAttempts: maxAttempts || 3,
        requiresPeerReview: false,
        isActive: true,
        createdBy: parseInt(userId),
        tags,
        prerequisites: prereqIds.map(String),
        learningObjectives: [],
      },
      include: {
        progress_events: { select: { eventType: true } },
        submissions: { select: { id: true } },
      },
    });

    const isCompleted = false;
    return {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      instructions: challenge.instructions,
      category: challenge.category,
      difficulty: challenge.difficulty,
      estimatedTimeMinutes: challenge.estimatedTimeMinutes,
      pointsReward: challenge.pointsReward,
      maxAttempts: challenge.maxAttempts,
      createdBy: challenge.createdBy,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
      goalId: goalId ? parseInt(goalId) : null,
      status: 'todo',
      prerequisites: prereqIds.map(String),
    };
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

    // Handle goalId update (retag)
    if (updateData.goalId !== undefined) {
      const newGoalId = updateData.goalId ? parseInt(updateData.goalId) : null;
      if (newGoalId) {
        const goal = await prisma.goals.findFirst({
          where: { id: newGoalId, userId: parseInt(userId) },
          select: { id: true },
        });
        if (!goal)
          throw new Error('Linked goal not found or not owned by user');
      }
      const existing = await prisma.challenges.findFirst({
        where: { id: parseInt(challengeId), createdBy: parseInt(userId) },
        select: { tags: true },
      });
      const otherTags = (existing?.tags || []).filter(
        (t) => !t.startsWith('goal:'),
      );
      const updatedTags = newGoalId
        ? [...otherTags, `goal:${newGoalId}`]
        : otherTags;
      data.tags = updatedTags;
    }

    // Handle prerequisites update with validation
    if (updateData.prerequisites !== undefined) {
      const prereqIds = (updateData.prerequisites || [])
        .map((id) => parseInt(id))
        .filter((n) => Number.isInteger(n) && n > 0);
      if (prereqIds.length) {
        const found = await prisma.challenges.findMany({
          where: { id: { in: prereqIds }, createdBy: parseInt(userId) },
          select: { id: true },
        });
        const foundIds = new Set(found.map((c) => c.id));
        const missing = prereqIds.filter((id) => !foundIds.has(id));
        if (missing.length) {
          throw new Error(
            `Prerequisite challenge(s) not found or not owned: ${missing.join(
              ', ',
            )}`,
          );
        }
      }
      data.prerequisites = prereqIds.map(String);
    }

    await prisma.challenges.updateMany({
      where: {
        id: parseInt(challengeId),
        createdBy: parseInt(userId),
      },
      data,
    });

    const ch = await prisma.challenges.findFirst({
      where: { id: parseInt(challengeId), createdBy: parseInt(userId) },
      include: {
        progress_events: { select: { eventType: true } },
        submissions: { select: { id: true } },
      },
    });
    if (!ch) return null;
    const goalTag = ch.tags?.find((t) => t.startsWith('goal:'));
    const linkedGoalId = goalTag ? parseInt(goalTag.split(':')[1]) : null;
    const isCompleted = ch.progress_events.some(
      (ev) => ev.eventType === 'challenge_completed',
    );
    const hasSubmissions = ch.submissions.length > 0;
    const status = isCompleted
      ? 'completed'
      : hasSubmissions
        ? 'in_progress'
        : 'todo';
    return {
      id: ch.id,
      title: ch.title,
      description: ch.description,
      instructions: ch.instructions,
      category: ch.category,
      difficulty: ch.difficulty,
      estimatedTimeMinutes: ch.estimatedTimeMinutes,
      pointsReward: ch.pointsReward,
      maxAttempts: ch.maxAttempts,
      createdBy: ch.createdBy,
      createdAt: ch.createdAt,
      updatedAt: ch.updatedAt,
      goalId: linkedGoalId,
      status,
      prerequisites: ch.prerequisites || [],
    };
  },

  // Delete a challenge (manual cascade for relations without DB cascade)
  deleteChallenge: async (challengeId, userId) => {
    const id = parseInt(challengeId);
    const uid = parseInt(userId);

    // Use a transaction to ensure atomic cleanup
    const [deletedEvents, deletedChallenges] = await prisma.$transaction([
      // Delete ALL progress events referencing this challenge (can't rely on userId)
      prisma.progress_events.deleteMany({
        where: { relatedChallengeId: id },
      }),
      // Delete the challenge (submissions will cascade due to onDelete: Cascade)
      prisma.challenges.deleteMany({
        where: { id, createdBy: uid },
      }),
    ]);

    // Return how many challenges were deleted
    return deletedChallenges.count;
  },

  // Mark a challenge as completed (creates progress event & updates goal progress)
  completeChallenge: async (challengeId, userId) => {
    const ch = await prisma.challenges.findFirst({
      where: { id: parseInt(challengeId), createdBy: parseInt(userId) },
      select: { id: true, pointsReward: true, tags: true, prerequisites: true },
    });
    if (!ch) throw new Error('Challenge not found');
    const goalTag = ch.tags?.find((t) => t.startsWith('goal:'));
    const goalId = goalTag ? parseInt(goalTag.split(':')[1]) : null;

    // Ensure prerequisites are completed
    const prereqIds = (ch.prerequisites || [])
      .map((s) => parseInt(s))
      .filter((n) => Number.isInteger(n) && n > 0);
    if (prereqIds.length) {
      const completed = await prisma.progress_events.findMany({
        where: {
          userId: parseInt(userId),
          eventType: 'challenge_completed',
          relatedChallengeId: { in: prereqIds },
        },
        select: { relatedChallengeId: true },
      });
      const completedSet = new Set(completed.map((e) => e.relatedChallengeId));
      const missing = prereqIds.filter((id) => !completedSet.has(id));
      if (missing.length) {
        throw new Error(
          `Complete prerequisite challenge(s) first: ${missing.join(', ')}`,
        );
      }
    }

    // Create progress event if not already existing (check for this user's completion)
    const existing = await prisma.progress_events.findFirst({
      where: {
        userId: parseInt(userId),
        relatedChallengeId: ch.id,
        eventType: 'challenge_completed',
      },
      select: { id: true },
    });
    if (!existing) {
      await prisma.progress_events.create({
        data: {
          userId: parseInt(userId),
          eventType: 'challenge_completed',
          pointsEarned: ch.pointsReward || 0,
          relatedChallengeId: ch.id,
          relatedGoalId: goalId || null,
          timestampOccurred: new Date(),
        },
      });
    }

    // Recalculate goal progress if linked
    if (goalId) {
      const { calculateCompletion } = require('./goalService');
      await calculateCompletion(goalId, userId);
    }

    // Return updated challenge with status
    return await challengeService.getChallengeById(challengeId, userId);
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
    return 'Medium';
  },
};

module.exports = challengeService;
