const challengeService = require('../../../src/services/challengeService');
const { PrismaClient } = require('@prisma/client');

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    challenges: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    goals: {
      findFirst: jest.fn(),
    },
    progress_events: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    submissions: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

const prisma = new PrismaClient();

describe('ChallengeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createChallenge', () => {
    test('should create challenge with valid data', async () => {
      const challengeData = {
        title: 'Test Challenge',
        description: 'Test description',
        instructions: 'Complete the task',
        category: 'programming',
        difficulty: 'Easy',
        pointsReward: 10,
      };

      const mockCreatedChallenge = {
        id: 1,
        ...challengeData,
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        prerequisites: [],
        progress_events: [],
        submissions: [],
      };

      prisma.challenges.create.mockResolvedValue(mockCreatedChallenge);

      const result = await challengeService.createChallenge(challengeData, 1);

      expect(prisma.challenges.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('title', 'Test Challenge');
      expect(result).toHaveProperty('status', 'todo');
    });

    test('should throw error if required fields missing', async () => {
      const invalidData = {
        title: 'Test',
        // Missing description and instructions
      };

      await expect(
        challengeService.createChallenge(invalidData, 1)
      ).rejects.toThrow('Title, description, and instructions are required');
    });

    test('should link challenge to goal when goalId provided', async () => {
      const challengeData = {
        title: 'Test Challenge',
        description: 'Test description',
        instructions: 'Complete the task',
        goalId: 5,
      };

      const mockGoal = { id: 5 };
      const mockCreatedChallenge = {
        id: 1,
        ...challengeData,
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['goal:5'],
        prerequisites: [],
        progress_events: [],
        submissions: [],
      };

      prisma.goals.findFirst.mockResolvedValue(mockGoal);
      prisma.challenges.create.mockResolvedValue(mockCreatedChallenge);

      const result = await challengeService.createChallenge(challengeData, 1);

      expect(prisma.goals.findFirst).toHaveBeenCalledWith({
        where: { id: 5, userId: 1 },
        select: { id: true },
      });
      expect(result.goalId).toBe(5);
    });
  });

  describe('getUserChallenges', () => {
    test('should return challenges for user', async () => {
      const mockChallenges = [
        {
          id: 1,
          title: 'Challenge 1',
          description: 'Description 1',
          instructions: 'Instructions 1',
          category: 'programming',
          difficulty: 'Easy',
          estimatedTimeMinutes: 30,
          pointsReward: 10,
          maxAttempts: 3,
          createdBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: [],
          prerequisites: [],
          progress_events: [],
          submissions: [],
        },
        {
          id: 2,
          title: 'Challenge 2',
          description: 'Description 2',
          instructions: 'Instructions 2',
          category: 'algorithms',
          difficulty: 'Medium',
          estimatedTimeMinutes: 60,
          pointsReward: 20,
          maxAttempts: 3,
          createdBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: [],
          prerequisites: [],
          progress_events: [{ eventType: 'challenge_completed' }],
          submissions: [{ id: 1, score: 85 }],
        },
      ];

      prisma.challenges.findMany.mockResolvedValue(mockChallenges);

      const result = await challengeService.getUserChallenges(1);

      expect(prisma.challenges.findMany).toHaveBeenCalledWith({
        where: { createdBy: 1 },
        include: {
          progress_events: {
            select: { eventType: true, relatedGoalId: true },
          },
          submissions: {
            where: { userId: 1 },
            select: { id: true, score: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('todo');
      expect(result[1].status).toBe('completed');
      expect(result[1].highestScore).toBe(85);
    });

    test('should filter challenges by category', async () => {
      prisma.challenges.findMany.mockResolvedValue([]);

      await challengeService.getUserChallenges(1, {
        category: 'programming',
      });

      expect(prisma.challenges.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'programming',
          }),
        })
      );
    });
  });

  describe('getChallengeById', () => {
    test('should return challenge with status', async () => {
      const mockChallenge = {
        id: 10,
        title: 'Test Challenge',
        description: 'Test description',
        instructions: 'Complete the task',
        category: 'programming',
        difficulty: 'Medium',
        estimatedTimeMinutes: 45,
        pointsReward: 15,
        maxAttempts: 3,
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['goal:5'],
        prerequisites: [],
        progress_events: [],
        submissions: [{ id: 1, score: 90 }],
      };

      prisma.challenges.findFirst.mockResolvedValue(mockChallenge);

      const result = await challengeService.getChallengeById(10, 1);

      expect(prisma.challenges.findFirst).toHaveBeenCalledWith({
        where: { id: 10, createdBy: 1 },
        include: {
          progress_events: {
            select: { eventType: true, relatedGoalId: true },
          },
          submissions: {
            where: { userId: 1 },
            select: { id: true, score: true },
          },
        },
      });
      expect(result).toHaveProperty('id', 10);
      expect(result.goalId).toBe(5);
      expect(result.status).toBe('in_progress');
      expect(result.highestScore).toBe(90);
    });

    test('should return null if challenge not found', async () => {
      prisma.challenges.findFirst.mockResolvedValue(null);

      const result = await challengeService.getChallengeById(999, 1);

      expect(result).toBeNull();
    });
  });

  describe('updateChallenge', () => {
    test('should update challenge fields', async () => {
      const updateData = {
        title: 'Updated Title',
        difficulty: 'Hard',
      };

      const mockUpdatedChallenge = {
        id: 10,
        title: 'Updated Title',
        description: 'Original description',
        instructions: 'Original instructions',
        category: 'programming',
        difficulty: 'Hard',
        estimatedTimeMinutes: 30,
        pointsReward: 10,
        maxAttempts: 3,
        createdBy: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        prerequisites: [],
        progress_events: [],
        submissions: [],
      };

      prisma.challenges.updateMany.mockResolvedValue({ count: 1 });
      prisma.challenges.findFirst.mockResolvedValue(mockUpdatedChallenge);

      const result = await challengeService.updateChallenge(10, 1, updateData);

      expect(prisma.challenges.updateMany).toHaveBeenCalledWith({
        where: { id: 10, createdBy: 1 },
        data: expect.objectContaining({
          title: 'Updated Title',
          difficulty: 'Hard',
        }),
      });
      expect(result.title).toBe('Updated Title');
      expect(result.difficulty).toBe('Hard');
    });
  });

  describe('deleteChallenge', () => {
    test('should delete challenge and related progress events', async () => {
      prisma.$transaction.mockResolvedValue([
        { count: 2 }, // deleted events
        { count: 1 }, // deleted challenges
      ]);

      const result = await challengeService.deleteChallenge(10, 1);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toBe(1);
    });
  });

  describe('completeChallenge', () => {
    test('should create progress event and mark challenge complete', async () => {
      const mockChallenge = {
        id: 10,
        pointsReward: 20,
        tags: ['goal:5'],
        prerequisites: [],
      };

      const mockCompletedChallenge = {
        id: 10,
        title: 'Test Challenge',
        status: 'completed',
        goalId: 5,
      };

      prisma.challenges.findFirst
        .mockResolvedValueOnce(mockChallenge)
        .mockResolvedValueOnce({
          ...mockChallenge,
          progress_events: [{ eventType: 'challenge_completed' }],
          submissions: [{ id: 1, score: 95 }],
          title: 'Test Challenge',
          description: 'Description',
          instructions: 'Instructions',
          category: 'programming',
          difficulty: 'Medium',
          estimatedTimeMinutes: 30,
          maxAttempts: 3,
          createdBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      prisma.progress_events.findFirst.mockResolvedValue(null);
      prisma.progress_events.create.mockResolvedValue({ id: 1 });

      // Mock goalService to avoid actual import
      jest.mock('../../../src/services/goalService', () => ({
        calculateCompletion: jest.fn().mockResolvedValue({ completion: 50 }),
      }));

      const result = await challengeService.completeChallenge(10, 1);

      expect(prisma.progress_events.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 1,
          eventType: 'challenge_completed',
          pointsEarned: 20,
          relatedChallengeId: 10,
          relatedGoalId: 5,
        }),
      });
      expect(result.status).toBe('completed');
    });
  });
});

module.exports = {};
