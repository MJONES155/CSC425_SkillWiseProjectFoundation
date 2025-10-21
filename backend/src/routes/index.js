/**
 * API Routes Index - Mounts all API endpoints under /api/*
 * 
 * Route Structure:
 * - /api/auth/*          - Authentication endpoints (login, register, logout, refresh)
 * - /api/users/*         - User management (profile, settings, statistics)
 * - /api/goals/*         - Learning goals CRUD operations
 * - /api/challenges/*    - Challenge management and participation
 * - /api/progress/*      - Progress tracking and analytics
 * - /api/submissions/*   - Work submission and evaluation
 * - /api/ai/*           - AI-powered features (feedback, hints, suggestions)
 * - /api/reviews/*       - Peer review system
 * - /api/leaderboard/*   - Rankings and achievements
 * - /api/health         - API health check endpoint
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const goalRoutes = require('./goals');
const challengeRoutes = require('./challenges');
const progressRoutes = require('./progress');
const submissionRoutes = require('./submissions');
const aiRoutes = require('./ai');
const reviewRoutes = require('./reviews');
const leaderboardRoutes = require('./leaderboard');

// API Documentation endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'SkillWise API',
    version: '1.0.0',
    description: 'AI-powered learning platform API',
    endpoints: {
      auth: '/api/auth - Authentication endpoints',
      users: '/api/users - User management',
      goals: '/api/goals - Learning goals',
      challenges: '/api/challenges - Learning challenges',
      progress: '/api/progress - Progress tracking',
      submissions: '/api/submissions - Work submissions',
      ai: '/api/ai - AI-powered features',
      reviews: '/api/reviews - Peer review system',
      leaderboard: '/api/leaderboard - Rankings and achievements',
      health: '/api/health - Health check'
    },
    documentation: '/api/docs',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/goals', goalRoutes);
router.use('/challenges', challengeRoutes);
router.use('/progress', progressRoutes);
router.use('/submissions', submissionRoutes);
router.use('/ai', aiRoutes);
router.use('/reviews', reviewRoutes);
router.use('/leaderboard', leaderboardRoutes);

// API Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'SkillWise API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    routes: {
      total: router.stack.length,
      mounted: [
        'auth', 'users', 'goals', 'challenges', 
        'progress', 'submissions', 'ai', 'reviews', 'leaderboard'
      ]
    }
  });
});

module.exports = router;