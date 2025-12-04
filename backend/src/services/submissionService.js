const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// TODO: Implement submission business logic
const submissionService = {
  // TODO: Submit challenge solution
  submitSolution: async (userId, challengeId, content) => {
    // Check max attempts
    const challenge = await prisma.challenges.findUnique({
      where: { id: challengeId },
      select: { maxAttempts: true },
    });

    const last = await prisma.submissions.findFirst({
      where: { userId, challengeId },
      orderBy: { attemptNumber: 'desc' },
    });
    const nextAttempt = last ? (last.attemptNumber || 1) + 1 : 1;

    // Enforce max attempts
    if (challenge?.maxAttempts && nextAttempt > challenge.maxAttempts) {
      throw new Error(
        `Maximum attempts (${challenge.maxAttempts}) reached for this challenge`
      );
    }

    return prisma.submissions.create({
      data: {
        userId,
        challengeId,
        submissionText: content,
        status: 'submitted',
        attemptNumber: nextAttempt,
      },
      select: { id: true, attemptNumber: true },
    });
  },

  createOrIncrementSubmission: async (userId, challengeId, content) => {
    return submissionService.submitSolution(userId, challengeId, content);
  },

  // TODO: Get submission by ID
  getSubmissionById: async (submissionId) => {
    const submission = await prisma.submissions.findUnique({
      where: { id: submissionId },
    });
    if (!submission) {
      throw new Error('Submission not found');
    }
    return submission;
  },

  // TODO: Get user submissions
  getUserSubmissions: async (userId) => {
    const submissions = await prisma.submissions.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'asc' },
    });
    return submissions;
  },

  // Get all submissions for a specific user and challenge with AI feedback
  getUserChallengeSubmissions: async (userId, challengeId) => {
    return prisma.submissions.findMany({
      where: {
        userId: parseInt(userId),
        challengeId: parseInt(challengeId),
      },
      include: {
        ai_feedback: {
          select: {
            id: true,
            feedbackText: true,
            feedbackType: true,
            confidenceScore: true,
            suggestions: true,
            strengths: true,
            improvements: true,
            createdAt: true,
          },
        },
      },
      orderBy: { attemptNumber: 'asc' },
    });
  },

  // Grade submission: AI-provided overallScore or fallback
  gradeSubmission: async (submissionId, feedbackData = null) => {
    const submission = await prisma.submissions.findUnique({
      where: { id: submissionId },
      include: {
        ai_feedback: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        challenges: {
          select: { difficulty: true },
        },
      },
    });
    if (!submission) {
      throw new Error('Submission not found');
    }

    // Use provided feedback or fetch latest AI feedback
    const feedback = feedbackData || submission.ai_feedback[0];
    if (!feedback) {
      throw new Error('No feedback available for grading');
    }

    // Prefer AI-provided overallScore if available and valid
    if (feedbackData && typeof feedbackData.overallScore === 'number') {
      const aiScore = Math.max(
        0,
        Math.min(100, Math.round(feedbackData.overallScore))
      );
      return prisma.submissions.update({
        where: { id: submissionId },
        data: { score: aiScore, status: 'graded', gradedAt: new Date() },
        select: { id: true, score: true, status: true },
      });
    }

    // If AI failed to generate proper feedback (fallback case detected), reject grading
    if (
      feedback.feedbackText === 'Unable to generate structured feedback.' ||
      (Array.isArray(feedback.strengths) &&
        feedback.strengths.length === 0 &&
        Array.isArray(feedback.improvements) &&
        feedback.improvements.length === 0)
    ) {
      throw new Error(
        'AI feedback generation failed; cannot grade submission without valid feedback'
      );
    }

    // Fallback (0-100 scale)
    let score = 60; // Base passing grade

    // Quality factors
    const strengthCount = feedback.strengths?.length || 0;
    const improvementCount = feedback.improvements?.length || 0;
    const confidenceScore = feedback.confidenceScore
      ? parseFloat(feedback.confidenceScore)
      : 0.7;

    // Positive points (max +30)
    score += Math.min(strengthCount * 10, 30); // Up to 5 strengths = +30

    // Deductions for improvements needed (max -20)
    score -= Math.min(improvementCount * 5, 20); // Up to 4 improvements = -20

    // Confidence adjustment (±10)
    score += (confidenceScore - 0.7) * 33; // Maps 0.4-1.0 confidence to -10 to +10

    // Difficulty adjustment
    const difficulty = submission.challenges?.difficulty || 'medium';
    if (difficulty === 'hard' && score >= 70) score += 5; // Bonus for hard challenges
    if (difficulty === 'easy' && score < 70) score -= 5; // Penalty for struggling on easy

    // Clamp to 0-100
    score = Math.max(0, Math.min(100, Math.round(score)));

    // Update submission with grade
    return prisma.submissions.update({
      where: { id: submissionId },
      data: {
        score,
        status: 'graded',
        gradedAt: new Date(),
      },
      select: { id: true, score: true, status: true },
    });
  },

  // TODO: Update submission status
  updateSubmissionStatus: async (submissionId, status) => {
    return prisma.submissions.update({
      where: { id: submissionId },
      data: { status },
    });
  },
};

module.exports = submissionService;
