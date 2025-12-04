// TODO: Implement goal controller unit tests
const goalController = require('../../../src/controllers/goalController');
const goalService = require('../../../src/services/goalService');

jest.mock('../../../src/services/goalService');

describe('GoalController', () => {
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

  describe('GET /goals', () => {
    test('should return user goals', async () => {
      const fakeGoals = [
        { id: 10, title: 'Learn Jest' },
        { id: 11, title: 'Build API' },
      ];

      goalService.getUserGoals.mockResolvedValue(fakeGoals);

      await goalController.getGoals(mockReq, mockRes, mockNext);

      expect(goalService.getUserGoals).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: fakeGoals,
      });
    });
  });

  describe('POST /goals', () => {
    test('should create new goal', async () => {
      mockReq.body = { title: 'New Goal' };

      const createdGoal = { id: 5, title: 'New Goal' };
      goalService.createGoal.mockResolvedValue(createdGoal);

      await goalController.createGoal(mockReq, mockRes, mockNext);

      expect(goalService.createGoal).toHaveBeenCalledWith(
        { title: 'New Goal' },
        1
      );

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: createdGoal,
      });
    });

    test('should validate goal data', async () => {
      mockReq.body = {}; // invalid data

      goalService.createGoal.mockRejectedValue(new Error('Invalid goal data'));

      await goalController.createGoal(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled(); // pushed error to error middleware
      expect(mockRes.json).not.toHaveBeenCalled(); // no early response
    });
  });

  describe('GET /goals/:id', () => {
    test('should return single goal', async () => {
      mockReq.params.id = 12;

      const fakeGoal = { id: 12, title: 'Test Goal' };
      goalService.getGoalById.mockResolvedValue(fakeGoal);

      await goalController.getGoalById(mockReq, mockRes, mockNext);

      expect(goalService.getGoalById).toHaveBeenCalledWith(12, 1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: fakeGoal,
      });
    });

    test('should return 404 if goal not found', async () => {
      mockReq.params.id = 55;

      goalService.getGoalById.mockResolvedValue(null);

      await goalController.getGoalById(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Goal not found',
      });
    });
  });

  // -----------------------------
  describe('PUT /goals/:id', () => {
    test('should update goal', async () => {
      mockReq.params.id = 7;
      mockReq.body = { title: 'Updated' };

      const updatedGoal = { id: 7, title: 'Updated' };

      goalService.updateGoal.mockResolvedValue(updatedGoal);

      await goalController.updateGoal(mockReq, mockRes, mockNext);

      expect(goalService.updateGoal).toHaveBeenCalledWith(7, 1, {
        title: 'Updated',
      });

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: updatedGoal,
      });
    });

    test('should return 404 when goal not found', async () => {
      mockReq.params.id = 7;
      mockReq.body = { title: 'Updated' };

      goalService.updateGoal.mockResolvedValue(null);

      await goalController.updateGoal(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Goal not found or not owned by user',
      });
    });
  });

  // -----------------------------
  describe('DELETE /goals/:id', () => {
    test('should delete goal', async () => {
      mockReq.params.id = 3;

      goalService.deleteGoal.mockResolvedValue(1);

      await goalController.deleteGoal(mockReq, mockRes, mockNext);
      expect(goalService.deleteGoal).toHaveBeenCalledWith(3, 1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Goal deleted successfully',
      });
    });

    test('should return 404 for missing goal', async () => {
      mockReq.params.id = 3;

      goalService.deleteGoal.mockResolvedValue(0);

      await goalController.deleteGoal(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Goal not found or not owned by user',
      });
    });
  });
});

module.exports = {};
