// TODO: Implement AI integration controller for feedback and hints
const aiService = require('../services/aiService');
const submissionService = require('../services/submissionService');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
// Removed zip file support; only single .js files are processed.
const prisma = new PrismaClient();
const Sentry = require('@sentry/node');

const aiController = {
  // TODO: Generate AI feedback for submission
  generateFeedback: async (req, res, next) => {
    let createdSubmissionId = null;
    let convertingDraft = false; // Track if we're converting a draft
    try {
      const userId = req.user.id;
      const { challengeId, submissionId, draft, draftId } = req.body;
      let { content } = req.body;

      console.log('generateFeedback called:', {
        userId,
        challengeId,
        draft,
        draftId,
        hasContent: !!content,
      });

      // Aggregate content from uploaded files if present and no raw content provided
      if (
        (!content || content.trim() === '') &&
        Array.isArray(req.files) &&
        req.files.length
      ) {
        try {
          let aggregated = '';
          // Allowed extension: only .js
          const allowedExt = new Set(['.js']);
          for (const file of req.files) {
            const ext = path.extname(file.originalname).toLowerCase();
            if (ext === '.zip') {
              // Reject zip uploads explicitly now.
              return res.status(400).json({
                message:
                  'ZIP uploads are no longer supported. Please submit a single .js file or paste code.',
              });
            } else if (allowedExt.has(ext)) {
              const fileData = fs.readFileSync(file.path, 'utf8');
              aggregated +=
                `\n/* File: ${file.originalname} */\n` + fileData + '\n';
            }
          }
          content = aggregated.trim();
        } catch (aggErr) {
          console.error('File aggregation failed:', aggErr);
          Sentry.captureException(aggErr);
          return res.status(400).json({
            message: 'Failed to process uploaded files',
            error: aggErr.message,
          });
        }
      }

      if (!challengeId || !content) {
        return res.status(400).json({
          message:
            'challengeId and content are required (provide text or supported files)',
        });
      }

      // Handle draft save without consuming attempts or invoking AI
      if (draft === true) {
        try {
          const draftSubmission = await prisma.submissions.create({
            data: {
              userId,
              challengeId: parseInt(challengeId),
              submissionText: content,
              status: 'draft',
              attemptNumber: 0,
            },
            select: { id: true, status: true, createdAt: true },
          });
          return res.status(201).json({
            message: 'Draft saved',
            submissionId: draftSubmission.id,
            status: draftSubmission.status,
            createdAt: draftSubmission.createdAt,
          });
        } catch (e) {
          console.error('Failed to save draft:', e);
          Sentry.captureException(e);
          return res
            .status(500)
            .json({ message: 'Failed to save draft', error: e.message });
        }
      }

      if (!submissionId) {
        const challenge = await prisma.challenges.findUnique({
          where: { id: parseInt(challengeId) },
          select: {
            maxAttempts: true,
            title: true,
            description: true,
            category: true,
            difficulty: true,
          },
        });

        if (!challenge) {
          return res.status(404).json({ message: 'Challenge not found' });
        }

        const existingSubmissions = await prisma.submissions.findMany({
          where: {
            userId,
            challengeId: parseInt(challengeId),
            status: { in: ['submitted', 'graded'] },
            attemptNumber: { gt: 0 }, // Exclude drafts (attemptNumber = 0)
          },
        });

        const currentAttemptCount = existingSubmissions.length;

        if (
          challenge.maxAttempts &&
          currentAttemptCount >= challenge.maxAttempts
        ) {
          return res.status(400).json({
            message: `Maximum attempts (${challenge.maxAttempts}) reached`,
            attemptsUsed: currentAttemptCount,
            maxAttempts: challenge.maxAttempts,
          });
        }

        const challengeContext = `Title: ${challenge.title}\nDescription: ${
          challenge.description || ''
        }\nCategory: ${challenge.category || ''}\nDifficulty: ${
          challenge.difficulty || ''
        }`;

        // Fetch previous attempts with feedback for progress tracking (exclude drafts)
        const previousAttempts = await prisma.submissions.findMany({
          where: {
            userId,
            challengeId: parseInt(challengeId),
            status: 'graded',
            attemptNumber: { gt: 0 }, // Exclude drafts
          },
          include: {
            ai_feedback: {
              select: {
                feedbackText: true,
                improvements: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
          orderBy: { attemptNumber: 'asc' },
        });

        // Map to simple format for AI context
        const attemptHistory = previousAttempts.map((att) => ({
          attemptNumber: att.attemptNumber,
          score: att.score,
          feedback: att.ai_feedback[0] || null,
        }));

        const feedbackObj = await aiService.generateFeedback(
          content,
          challengeContext,
          attemptHistory
        );

        const nextAttempt = currentAttemptCount + 1;
        // Prepare submissionFiles metadata if files uploaded
        let submissionFilesMeta = null;
        if (Array.isArray(req.files) && req.files.length) {
          submissionFilesMeta = req.files.map((f) => ({
            originalName: f.originalname,
            storedName: path.basename(f.path),
            size: f.size,
            mimetype: f.mimetype,
            path: f.path.replace(/\\/g, '/'),
          }));
        }

        // Check if converting an existing draft to a real submission
        let newSubmission;
        if (draftId) {
          convertingDraft = true;
          console.log('Converting draft to submission:', draftId);

          // Verify the draft exists and belongs to this user
          const existingDraft = await prisma.submissions.findFirst({
            where: {
              id: parseInt(draftId),
              userId,
              challengeId: parseInt(challengeId),
              status: 'draft',
              attemptNumber: 0,
            },
          });

          if (!existingDraft) {
            return res
              .status(400)
              .json({ message: 'Draft not found or already submitted' });
          }

          // Convert draft to real submission
          newSubmission = await prisma.submissions.update({
            where: { id: parseInt(draftId) },
            data: {
              submissionText: content, // Update with current content
              submissionFiles: submissionFilesMeta,
              status: 'submitted',
              attemptNumber: nextAttempt,
              submittedAt: new Date(),
            },
          });
        } else {
          // Create new submission
          newSubmission = await prisma.submissions.create({
            data: {
              userId,
              challengeId: parseInt(challengeId),
              submissionText: content,
              submissionFiles: submissionFilesMeta,
              status: 'submitted',
              attemptNumber: nextAttempt,
            },
          });
        }
        createdSubmissionId = newSubmission.id;

        const saved = await prisma.ai_feedback.create({
          data: {
            submissionId: createdSubmissionId,
            feedbackText: feedbackObj.feedbackText || 'No feedback returned',
            feedbackType: feedbackObj.feedbackType || 'general',
            confidenceScore:
              typeof feedbackObj.confidenceScore === 'number'
                ? feedbackObj.confidenceScore
                : null,
            suggestions: Array.isArray(feedbackObj.suggestions)
              ? feedbackObj.suggestions
              : [],
            strengths: Array.isArray(feedbackObj.strengths)
              ? feedbackObj.strengths
              : [],
            improvements: Array.isArray(feedbackObj.improvements)
              ? feedbackObj.improvements
              : [],
            aiModel: process.env.HF_MODEL_NAME || 'unknown-model',
            processingTimeMs: feedbackObj.processingTimeMs || null,
          },
          select: {
            id: true,
            feedbackText: true,
            feedbackType: true,
            suggestions: true,
            strengths: true,
            improvements: true,
            confidenceScore: true,
          },
        });

        let gradeResult = null;
        try {
          gradeResult = await submissionService.gradeSubmission(
            createdSubmissionId,
            feedbackObj
          );
        } catch (gradeErr) {
          console.error('Auto-grading failed:', gradeErr.message);

          // If grading failed due to bad AI feedback, return error to user
          if (gradeErr.message.includes('AI feedback generation failed')) {
            console.log(
              'AI feedback failed, cleaning up. convertingDraft:',
              convertingDraft,
              'draftId:',
              draftId
            );

            // Delete the bad feedback and revert submission
            try {
              await prisma.ai_feedback.deleteMany({
                where: { submissionId: createdSubmissionId },
              });

              // If this was a converted draft, revert it back to draft status
              if (convertingDraft && draftId) {
                console.log('Reverting draft back to draft status:', draftId);
                await prisma.submissions.update({
                  where: { id: createdSubmissionId },
                  data: {
                    status: 'draft',
                    attemptNumber: 0,
                    submittedAt: null,
                  },
                });
              } else {
                // Otherwise delete the newly created submission
                console.log(
                  'Deleting newly created submission:',
                  createdSubmissionId
                );
                await prisma.submissions.delete({
                  where: { id: createdSubmissionId },
                });
              }
            } catch (cleanupErr) {
              console.error('Cleanup failed:', cleanupErr);
              Sentry.captureException(cleanupErr);
            }

            return res.status(500).json({
              message: 'AI feedback generation failed. Please try again.',
              error:
                'The AI service did not return valid feedback. Your attempt was not counted.',
            });
          }
        }

        // Create progress event if grading succeeded and challenge is tagged to a goal
        if (gradeResult?.score != null) {
          try {
            const challengeWithTags = await prisma.challenges.findUnique({
              where: { id: parseInt(challengeId) },
              select: { tags: true, pointsReward: true, createdBy: true },
            });
            console.log('Challenge tags for progress:', {
              challengeId,
              tags: challengeWithTags?.tags,
              createdBy: challengeWithTags?.createdBy,
              userId,
            });

            const goalTag = challengeWithTags?.tags?.find((t) =>
              t.startsWith('goal:')
            );
            const goalId = goalTag ? parseInt(goalTag.split(':')[1]) : null;
            console.log('Extracted goalId:', goalId, 'from tag:', goalTag);

            // Only create progress event for first successful submission (avoid duplicates)
            if (goalId) {
              const existingEvent = await prisma.progress_events.findFirst({
                where: {
                  userId,
                  relatedChallengeId: parseInt(challengeId),
                  eventType: 'challenge_completed',
                },
                select: { id: true },
              });

              if (!existingEvent) {
                console.log(
                  'Creating progress event for challenge completion:',
                  { userId, challengeId, goalId }
                );
                await prisma.progress_events.create({
                  data: {
                    userId,
                    eventType: 'challenge_completed',
                    pointsEarned: challengeWithTags.pointsReward || 0,
                    relatedChallengeId: parseInt(challengeId),
                    relatedGoalId: goalId,
                    relatedSubmissionId: createdSubmissionId,
                    timestampOccurred: new Date(),
                  },
                });

                // Recalculate goal progress
                console.log('Recalculating goal progress for goalId:', goalId);
                const {
                  calculateCompletion,
                } = require('../services/goalService');
                const result = await calculateCompletion(goalId, userId);
                console.log('Goal progress recalculation result:', result);
              } else {
                console.log(
                  'Progress event already exists for this challenge, skipping'
                );
              }
            }
          } catch (progressErr) {
            console.error(
              'Failed to create progress event:',
              progressErr.message
            );
            Sentry.captureException(progressErr);
          }
        }

        return res.status(200).json({
          submissionId: createdSubmissionId,
          feedback: saved.feedbackText,
          meta: saved,
          score: gradeResult?.score || null,
          attemptNumber: nextAttempt,
        });
      } else {
        const challenge = await prisma.challenges.findFirst({
          where: { id: parseInt(challengeId) },
          select: {
            title: true,
            description: true,
            category: true,
            difficulty: true,
          },
        });

        const challengeContext = challenge
          ? `Title: ${challenge.title}\nDescription: ${
              challenge.description || ''
            }\nCategory: ${challenge.category || ''}\nDifficulty: ${
              challenge.difficulty || ''
            }`
          : '';

        const feedbackObj = await aiService.generateFeedback(
          content,
          challengeContext
        );

        const saved = await prisma.ai_feedback.create({
          data: {
            submissionId: parseInt(submissionId),
            feedbackText: feedbackObj.feedbackText || 'No feedback returned',
            feedbackType: feedbackObj.feedbackType || 'general',
            confidenceScore:
              typeof feedbackObj.confidenceScore === 'number'
                ? feedbackObj.confidenceScore
                : null,
            suggestions: Array.isArray(feedbackObj.suggestions)
              ? feedbackObj.suggestions
              : [],
            strengths: Array.isArray(feedbackObj.strengths)
              ? feedbackObj.strengths
              : [],
            improvements: Array.isArray(feedbackObj.improvements)
              ? feedbackObj.improvements
              : [],
            aiModel: process.env.HF_MODEL_NAME || 'unknown-model',
            processingTimeMs: feedbackObj.processingTimeMs || null,
          },
          select: {
            id: true,
            feedbackText: true,
            feedbackType: true,
            suggestions: true,
            strengths: true,
            improvements: true,
            confidenceScore: true,
          },
        });

        return res.status(200).json({
          submissionId: parseInt(submissionId),
          feedback: saved.feedbackText,
          meta: saved,
        });
      }
    } catch (err) {
      console.error('AI feedback failed:', err);
      Sentry.captureException(err);

      // Rollback created submission if applicable

      if (createdSubmissionId) {
        try {
          await prisma.submissions.delete({
            where: { id: createdSubmissionId },
          });
          console.log(`Rolled back submission ${createdSubmissionId}`);
        } catch (deleteErr) {
          console.error('Rollback failed:', deleteErr);
          Sentry.captureException(deleteErr);
        }
      }

      return res
        .status(500)
        .json({ message: 'AI feedback failed', error: err.message });
    }
  },

  // TODO: Get AI hints for challenge
  getHints: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const challengeId = parseInt(req.params.challengeId);

      const challenge = await prisma.challenges.findFirst({
        where: { id: challengeId },
        select: {
          title: true,
          description: true,
          category: true,
          difficulty: true,
          tags: true,
        },
      });
      if (!challenge)
        return res.status(404).json({ message: 'Challenge not found' });

      const lastSubmission = await prisma.submissions.findFirst({
        where: { userId, challengeId },
        orderBy: { attemptNumber: 'desc' },
        include: {
          ai_feedback: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { feedbackText: true, improvements: true },
          },
        },
      });

      const userProgress = {
        challengeContext: `Title: ${challenge.title}\nDescription: ${
          challenge.description || ''
        }\nCategory: ${challenge.category || ''}\nDifficulty: ${
          challenge.difficulty || ''
        }`,
        lastFeedbackText: lastSubmission?.ai_feedback?.[0]?.feedbackText || '',
        improvements: lastSubmission?.ai_feedback?.[0]?.improvements || [],
      };

      const hints = await aiService.generateHints(challengeId, userProgress);
      return res.status(200).json(hints);
    } catch (err) {
      console.error('Get hints failed:', err);
      Sentry.captureException(err);
      return res
        .status(500)
        .json({ message: 'Failed to generate hints', error: err.message });
    }
  },

  // TODO: Generate challenge suggestions
  suggestChallenges: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { goalId } = req.query;

      const challenge = await aiService.suggestNextChallenges(userId, goalId);

      return res.status(200).json(challenge);
    } catch (err) {
      console.error('AI Suggest Challenge Error:', err);
      Sentry.captureException(err);
      return res.status(500).json({
        message: 'Failed to generate AI challenge',
        error: err.message,
      });
    }
  },

  // TODO: Analyze learning progress
  analyzeProgress: async (req, res, next) => {
    // Implementation needed
  },
};

module.exports = aiController;
