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
        first_name: true,
        last_name: true,
        email: true,
        created_at: true,
        updated_at: true,
      },
    });
  },

  // TODO: Update user profile
  updateProfile: async (userId, profileData) => {
    return await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        first_name: profileData.first_name || undefined,
        last_name: profileData.last_name || undefined,
        updated_at: new Date(),
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        created_at: true,
        updated_at: true,
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
    const user = await prisma.users.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        created_at: true,
        last_login: true,
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
