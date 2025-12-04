const aiService = require('../../../src/services/aiService');
const submissionService = require('../../../src/services/submissionService');

jest.mock('../../../src/services/aiService');
jest.mock('../../../src/services/submissionService');

// Mock Prisma with inline mock object
jest.mock('@prisma/client', () => {
  const mockInstance = {
    challenges: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    submissions: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    ai_feedback: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    progress_events: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    goals: {
      update: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(function () {
      return mockInstance;
    }),
  };
});

const { PrismaClient } = require('@prisma/client');
const mockPrisma = new PrismaClient();
const aiController = require('../../../src/controllers/aiController');

describe('AIController Snapshot Tests', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      user: { id: 1 },
      params: {},
      body: {},
      query: {},
      files: [],
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  describe('generateFeedback', () => {
    test('should generate feedback for valid submission and match snapshot', async () => {
      mockReq.body = {
        challengeId: 10,
        content: 'function add(a, b) { return a + b; }',
      };

      const mockChallenge = {
        id: 10,
        title: 'Addition Function',
        description: 'Create an add function',
        maxAttempts: 3,
        category: 'programming',
        difficulty: 'easy',
      };

      const mockFeedback = {
        feedbackText: 'Excellent implementation of the addition function!',
        feedbackType: 'general',
        confidenceScore: 0.9,
        overallScore: 90,
        strengths: ['Clean code', 'Proper return statement'],
        improvements: ['Add input validation'],
        suggestions: ['Consider edge cases'],
        processingTimeMs: 150,
      };

      const mockSubmission = {
        id: 100,
        challengeId: 10,
        userId: 1,
        submissionText: mockReq.body.content,
        score: 90,
        attemptNumber: 1,
        status: 'graded',
      };

      const mockAIFeedback = {
        id: 1,
        feedbackText: mockFeedback.feedbackText,
        feedbackType: mockFeedback.feedbackType,
        suggestions: mockFeedback.suggestions,
        strengths: mockFeedback.strengths,
        improvements: mockFeedback.improvements,
        confidenceScore: mockFeedback.confidenceScore,
      };

      mockPrisma.challenges.findUnique.mockResolvedValue(mockChallenge);
      mockPrisma.submissions.findMany.mockResolvedValue([]);
      aiService.generateFeedback.mockResolvedValue(mockFeedback);
      mockPrisma.submissions.create.mockResolvedValue(mockSubmission);
      mockPrisma.ai_feedback.create.mockResolvedValue(mockAIFeedback);
      submissionService.gradeSubmission.mockResolvedValue({ score: 90 });

      await aiController.generateFeedback(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const responseData = mockRes.json.mock.calls[0][0];
      expect(responseData).toMatchSnapshot();
      expect(responseData.submissionId).toBe(100);
      expect(responseData.score).toBe(90);
    });

    test('should save draft without AI feedback', async () => {
      mockReq.body = {
        challengeId: 10,
        content: 'function multiply(a, b) { return a * b; }',
        draft: true,
      };

      const mockDraft = {
        id: 50,
        status: 'draft',
        createdAt: new Date(),
      };

      mockPrisma.submissions.create.mockResolvedValue(mockDraft);

      await aiController.generateFeedback(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      const responseData = mockRes.json.mock.calls[0][0];
      const { createdAt, ...snapshotData } = responseData;
      expect(snapshotData).toMatchSnapshot();
      expect(responseData.message).toBe('Draft saved');
      expect(responseData.submissionId).toBe(50);
      expect(createdAt).toBeDefined();
    });
  });

  describe('getHints', () => {
    test('should return hints for valid challenge ID and match snapshot', async () => {
      mockReq.params.challengeId = '10';

      const mockChallenge = {
        id: 10,
        title: 'Array Sorting',
        description: 'Implement bubble sort',
        category: 'algorithms',
        difficulty: 'medium',
        tags: ['sorting'],
      };

      const mockLastSubmission = {
        id: 1,
        ai_feedback: [
          {
            feedbackText: 'Good attempt but needs optimization',
            improvements: ['Improve time complexity', 'Handle edge cases'],
          },
        ],
      };

      const mockHints = {
        success: true,
        data: {
          hints: [
            'Consider the number of comparisons needed',
            'Think about when to stop the outer loop',
            'Remember to swap elements when needed',
          ],
        },
      };

      mockPrisma.challenges.findFirst.mockResolvedValue(mockChallenge);
      mockPrisma.submissions.findFirst.mockResolvedValue(mockLastSubmission);
      aiService.generateHints.mockResolvedValue(mockHints);

      await aiController.getHints(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const responseData = mockRes.json.mock.calls[0][0];
      expect(responseData).toMatchSnapshot();
    });

    test('should handle errors when challenge not found', async () => {
      mockReq.params.challengeId = '999';

      mockPrisma.challenges.findFirst.mockResolvedValue(null);

      await aiController.getHints(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      const responseData = mockRes.json.mock.calls[0][0];
      expect(responseData).toMatchSnapshot();
    });
  });

  describe('suggestChallenges', () => {
    test('should suggest challenges based on goal and match snapshot', async () => {
      mockReq.query.goalId = '5';

      const mockChallenge = {
        title: 'Build a Calculator',
        description: 'Create a basic calculator',
        instructions:
          'Implement add, subtract, multiply, divide. Submit .js file.',
        category: 'programming',
        difficulty: 'easy',
        estimatedTimeMinutes: 30,
        pointsReward: 50,
        maxAttempts: 3,
      };

      aiService.suggestNextChallenges.mockResolvedValue(mockChallenge);

      await aiController.suggestChallenges(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      const responseData = mockRes.json.mock.calls[0][0];
      expect(responseData).toMatchSnapshot();
      expect(responseData.title).toBeDefined();
    });

    test('should handle AI service errors', async () => {
      mockReq.query.goalId = '5';

      aiService.suggestNextChallenges.mockRejectedValue(
        new Error('AI generation failed')
      );

      await aiController.suggestChallenges(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      const responseData = mockRes.json.mock.calls[0][0];
      expect(responseData).toMatchSnapshot();
      expect(responseData.message).toContain('Failed to generate');
    });
  });
});
