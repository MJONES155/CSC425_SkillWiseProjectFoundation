// AI Service Unit Tests with Snapshots
const aiService = require('../../../src/services/aiService');
const axios = require('axios');

jest.mock('axios');

describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateFeedback', () => {
    test('should generate meaningful feedback and match snapshot', async () => {
      const mockAIResponse = {
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  feedbackText:
                    'Great work on implementing the function! Your code demonstrates good understanding of JavaScript fundamentals.',
                  feedbackType: 'general',
                  confidenceScore: 0.85,
                  overallScore: 85,
                  strengths: [
                    'Clear variable naming',
                    'Proper error handling',
                    'Good code structure',
                  ],
                  improvements: [
                    'Consider edge cases',
                    'Add more comments',
                    'Optimize loop performance',
                  ],
                  suggestions: [
                    'Try using map instead of forEach',
                    'Extract validation to a separate function',
                    'Add unit tests',
                  ],
                  processingTimeMs: 0,
                }),
              },
            },
          ],
        },
      };

      axios.post.mockResolvedValue(mockAIResponse);

      const result = await aiService.generateFeedback(
        'function sum(a, b) { return a + b; }',
        'Create a function that adds two numbers',
        []
      );

      expect(result).toMatchSnapshot();
      expect(result.feedbackText).toBeDefined();
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(result.strengths)).toBe(true);
      expect(Array.isArray(result.improvements)).toBe(true);
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    test('should handle feedback with previous attempts and match snapshot', async () => {
      const mockAIResponse = {
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  feedbackText:
                    'Excellent improvement! You addressed the validation issues from the previous attempt.',
                  feedbackType: 'general',
                  confidenceScore: 0.92,
                  overallScore: 92,
                  strengths: [
                    'Implemented input validation',
                    'Fixed error handling',
                    'Improved code readability',
                  ],
                  improvements: [
                    'Add type checking',
                    'Consider performance optimization',
                  ],
                  suggestions: [
                    'Use TypeScript for better type safety',
                    'Add JSDoc comments',
                  ],
                  processingTimeMs: 0,
                }),
              },
            },
          ],
        },
      };

      axios.post.mockResolvedValue(mockAIResponse);

      const previousAttempts = [
        {
          attemptNumber: 1,
          score: 70,
          feedback: {
            feedbackText: 'Missing input validation',
            improvements: ['Add validation', 'Handle edge cases'],
          },
        },
      ];

      const result = await aiService.generateFeedback(
        'function sum(a, b) { if(typeof a !== "number") throw new Error("Invalid"); return a + b; }',
        'Create a function that adds two numbers',
        previousAttempts
      );

      expect(result).toMatchSnapshot();
      expect(result.overallScore).toBeGreaterThan(70); // Should improve
    });

    test('should handle API errors gracefully', async () => {
      axios.post.mockRejectedValue(new Error('API error'));

      const result = await aiService.generateFeedback(
        'test code',
        'test context',
        []
      );

      expect(result).toMatchSnapshot();
      expect(result.feedbackText).toContain('Error');
      expect(result.confidenceScore).toBe(0);
    });
  });

  describe('generateHints', () => {
    test('should provide contextual hints and match snapshot', async () => {
      const mockAIResponse = {
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  hints: [
                    'Check your loop boundaries to avoid off-by-one errors',
                    'Consider what happens when the array is empty',
                    'Think about whether you need to modify the original array',
                  ],
                }),
              },
            },
          ],
        },
      };

      axios.post.mockResolvedValue(mockAIResponse);

      const userProgress = {
        challengeContext: 'Implement array sorting',
        lastFeedbackText: 'Good attempt but check edge cases',
        improvements: ['Handle empty arrays', 'Optimize performance'],
      };

      const result = await aiService.generateHints(1, userProgress);

      expect(result).toMatchSnapshot();
      expect(result.hints).toBeDefined();
      expect(Array.isArray(result.hints)).toBe(true);
      expect(result.hints.length).toBeGreaterThan(0);
    });

    test('should return fallback hints on API error', async () => {
      axios.post.mockRejectedValue(new Error('API error'));

      const result = await aiService.generateHints(1, {
        challengeContext: 'Test',
      });

      expect(result).toMatchSnapshot();
      expect(result.hints).toBeDefined();
      expect(result.hints.length).toBe(3);
    });
  });

  describe('suggestNextChallenges', () => {
    test('should generate challenge suggestion and match snapshot', async () => {
      const mockAIResponse = {
        data: {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  title: 'Build a Todo List Manager',
                  description:
                    'Create a command-line todo list to practice CRUD operations',
                  instructions:
                    'Implement add, remove, list, and complete functions. Submit a single .js file.',
                  category: 'programming',
                  difficulty: 'medium',
                  estimatedTimeMinutes: 45,
                  pointsReward: 75,
                  maxAttempts: 3,
                }),
              },
            },
          ],
        },
      };

      axios.post.mockResolvedValue(mockAIResponse);

      // Mock Prisma findFirst
      const { PrismaClient } = require('@prisma/client');
      const prismaMock = new PrismaClient();
      prismaMock.goals = {
        findFirst: jest.fn().mockResolvedValue({
          id: 1,
          title: 'Learn JavaScript',
          description: 'Master JS fundamentals',
          category: 'Programming',
          difficulty: 'Medium',
        }),
      };

      // Temporarily replace the prisma instance
      const originalPrisma = require('../../../src/services/aiService');

      const result = await aiService.suggestNextChallenges(1, 1);

      expect(result).toMatchSnapshot();
      expect(result.title).toBeDefined();
      expect(result.instructions).toContain('.js');
    });
  });
});

module.exports = {};
