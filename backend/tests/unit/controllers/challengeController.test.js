// TODO: Implement challenge controller unit tests
const challengeController = require('../../../src/controllers/challengeController');
const challengeService = require('../../../src/services/challengeService');

jest.mock('../../../src/services/challengeService');

describe('ChallengeController', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      user: { id: 1 },
      params: {},
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  describe('GET /challenges', () => {
    test('should return challenges with filters', async () => {
      const fakeChallenges = [{ id: 10, title: 'Test' }];
      challengeService.getUserChallenges.mockResolvedValue(fakeChallenges);

      await challengeController.getChallenges(mockReq, mockRes, mockNext);

      expect(challengeService.getUserChallenges).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: fakeChallenges,
      });
    });
  });

  describe('POST /challenges', () => {
    test('should create new challenge', async () => {
      const newChallenge = {
        id: 20,
        title: 'New Challenge',
        description: 'Test description',
        status: 'todo',
      };

      mockReq.body = {
        title: 'New Challenge',
        description: 'Test description',
        instructions: 'Complete the task',
      };

      challengeService.createChallenge.mockResolvedValue(newChallenge);

      await challengeController.createChallenge(mockReq, mockRes, mockNext);

      expect(challengeService.createChallenge).toHaveBeenCalledWith(
        mockReq.body,
        1
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: newChallenge,
      });
    });
  });

  describe('GET /challenges/:id', () => {
    test('should return single challenge', async () => {
      const challenge = {
        id: 10,
        title: 'Test Challenge',
        description: 'Description',
      };

      mockReq.params.id = '10';
      challengeService.getChallengeById.mockResolvedValue(challenge);

      await challengeController.getChallengeById(mockReq, mockRes, mockNext);

      expect(challengeService.getChallengeById).toHaveBeenCalledWith('10', 1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: challenge,
      });
    });

    test('should return 404 if challenge not found', async () => {
      mockReq.params.id = '999';
      challengeService.getChallengeById.mockResolvedValue(null);

      await challengeController.getChallengeById(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Challenge not found',
      });
    });
  });

  describe('PUT /challenges/:id', () => {
    test('should update challenge', async () => {
      const updatedChallenge = {
        id: 10,
        title: 'Updated Title',
        description: 'Updated description',
      };

      mockReq.params.id = '10';
      mockReq.body = { title: 'Updated Title' };
      challengeService.updateChallenge.mockResolvedValue(updatedChallenge);

      await challengeController.updateChallenge(mockReq, mockRes, mockNext);

      expect(challengeService.updateChallenge).toHaveBeenCalledWith(
        '10',
        1,
        mockReq.body
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: updatedChallenge,
      });
    });

    test('should return 404 if challenge not found', async () => {
      mockReq.params.id = '999';
      mockReq.body = { title: 'Updated' };
      challengeService.updateChallenge.mockResolvedValue(null);

      await challengeController.updateChallenge(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Challenge not found or not owned by user',
      });
    });
  });

  describe('DELETE /challenges/:id', () => {
    test('should delete challenge', async () => {
      mockReq.params.id = '10';
      challengeService.deleteChallenge.mockResolvedValue(1);

      await challengeController.deleteChallenge(mockReq, mockRes, mockNext);

      expect(challengeService.deleteChallenge).toHaveBeenCalledWith('10', 1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Challenge deleted successfully',
      });
    });

    test('should return 404 if challenge not found', async () => {
      mockReq.params.id = '999';
      challengeService.deleteChallenge.mockResolvedValue(0);

      await challengeController.deleteChallenge(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Challenge not found or not owned by user',
      });
    });
  });

  describe('POST /challenges/:id/complete', () => {
    test('should mark challenge as completed', async () => {
      const completedChallenge = {
        id: 10,
        title: 'Test Challenge',
        status: 'completed',
      };

      mockReq.params.id = '10';
      challengeService.completeChallenge.mockResolvedValue(completedChallenge);

      await challengeController.completeChallenge(mockReq, mockRes, mockNext);

      expect(challengeService.completeChallenge).toHaveBeenCalledWith('10', 1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: completedChallenge,
        message: 'Challenge marked as completed',
      });
    });
  });
});

module.exports = {};
