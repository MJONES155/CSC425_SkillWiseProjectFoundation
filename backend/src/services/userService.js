// TODO: User service for database operations and business logic
//Partially Complete: userService, updateProfile, and deleteUser logical
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

const userService = {
  // TODO: Get user by ID
  getUserById: async (userId) => {
    return await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // TODO: Update user profile
  updateProfile: async (userId, profileData) => {
    return await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        firstName: profileData.firstName || undefined,
        lastName: profileData.lastName || undefined,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // TODO: Delete user account
  deleteUser: async (userId) => {
    await prisma.user.delete({
      where: { id: parseInt(userId) },
    });
  },

  // TODO: Get user statistics
  getUserStats: async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        createdAt: true,
        lastLogin: true,
      },
    });
    return {
      totalGoals: 0,
      completedChallenges: 0,
      lastLogin: new Date(),
    };
  },
};

module.exports = userService;
