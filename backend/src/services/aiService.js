const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const Sentry = require('@sentry/node');

const HF_API_KEY = process.env.HF_API_KEY;
const HF_API_URL = process.env.HF_API_URL;
const HF_MODEL_NAME = process.env.HF_MODEL_NAME || 'openai/gpt-oss-20b:novita';

async function callHF(prompt, maxTokens = 2000) {
  try {
    const { data } = await axios.post(
      `${HF_API_URL}/chat/completions`,
      {
        model: HF_MODEL_NAME,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: maxTokens,
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // OpenAI-compatible response: data.choices[0].message.content
    if (data && data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }

    // Fallback to other common HF response shapes
    if (Array.isArray(data)) {
      const first = data[0] || {};
      if (typeof first === 'string') return first;
      if (first.generated_text) return first.generated_text;
      if (first.summary_text) return first.summary_text;
      return JSON.stringify(first);
    }
    if (typeof data === 'string') return data;
    if (data && data.generated_text) return data.generated_text;
    return JSON.stringify(data);
  } catch (err) {
    Sentry.captureException(err);
    if (err.response) {
      console.error('HF error status:', err.response.status);
      console.error('HF error data:', err.response.data);
    } else if (err.request) {
      console.error('No response received from HF');
    } else {
      console.error('Request setup error:', err.message);
    }
    throw err;
  }
}

const aiService = {
  generateFeedback: async (
    submissionText,
    challengeContext,
    previousAttempts = []
  ) => {
    try {
      // Build context from previous attempts
      let historyContext = '';
      if (previousAttempts.length > 0) {
        historyContext =
          '\n\nPREVIOUS SUBMISSION HISTORY (for context and progress tracking):';
        previousAttempts.forEach((attempt, idx) => {
          historyContext += `\n\nAttempt ${
            attempt.attemptNumber || idx + 1
          } (Score: ${attempt.score || 'N/A'}):`;
          if (attempt.feedback) {
            historyContext += `\nPrevious feedback: ${
              attempt.feedback.feedbackText || ''
            }`;
            if (
              attempt.feedback.improvements &&
              attempt.feedback.improvements.length > 0
            ) {
              historyContext += `\nPrevious improvements suggested: ${attempt.feedback.improvements.join(
                '; '
              )}`;
            }
          }
        });
        historyContext +=
          '\n\nIMPORTANT: Recognize improvements made since earlier attempts. If the learner addressed previous feedback, acknowledge progress and award higher scores accordingly. Do not penalize for issues already fixed.';
      }

      const prompt = `You are an expert mentor providing detailed, constructive feedback.

      Analyze the submission and provide comprehensive feedback in the following JSON format (ONLY return valid JSON, no markdown):

      {
        "feedbackText": "A detailed paragraph summarizing your overall assessment with specific examples",
        "feedbackType": "general",
        "confidenceScore": <number between 0.0 and 1.0>,
        "overallScore": <integer between 0 and 100>,
        "strengths": ["Specific strength 1", "Specific strength 2", "Specific strength 3"],
        "improvements": ["Specific area to improve 1", "Specific area to improve 2", "Specific area to improve 3"],
        "suggestions": ["Actionable suggestion 1", "Actionable suggestion 2", "Actionable suggestion 3"],
        "processingTimeMs": 0
      }

      Context:
      ${challengeContext || 'N/A'}
      ${historyContext}

      CURRENT SUBMISSION:
      ${submissionText}

      CRITICAL SCORING INSTRUCTIONS:
      - Evaluate "overallScore" based on actual submission quality. DO NOT use placeholder values.
      - Grade scale: 90-100 (exceptional/flawless), 80-89 (excellent), 70-79 (good/solid), 60-69 (adequate), 50-59 (needs improvement), below 50 (poor/incomplete).
      - Assess: correctness, code quality, efficiency, readability, best practices, completeness.
      - If previous attempts exist, REWARD IMPROVEMENT: if this submission addresses earlier feedback, increase the score significantly to reflect learning progress.
      - Vary your scores meaningfully based on what you observe in the submission.


      Provide detailed, specific feedback with concrete examples.`;

      const start = Date.now();

      let output = await callHF(prompt, 2500);
      output = output.trim();

      // Extract JSON from response
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : null;

      let obj;
      try {
        obj = JSON.parse(jsonText);
      } catch (e) {
        Sentry.captureException(e);
        console.error('Failed to parse JSON from HF:', output);
        return {
          feedbackText: 'Unable to generate structured feedback.',
          feedbackType: 'general',
          confidenceScore: 0,
          strengths: [],
          improvements: [],
          suggestions: [],
          processingTimeMs: Date.now() - start,
        };
      }

      obj.processingTimeMs = Date.now() - start;
      return obj;
    } catch (err) {
      Sentry.captureException(err);
      console.error('HF Feedback Error:', err.message);
      return {
        feedbackText: 'Error while generating AI feedback.',
        feedbackType: 'general',
        confidenceScore: 0,
        strengths: [],
        improvements: [],
        suggestions: [],
        processingTimeMs: null,
      };
    }
  },

  // TODO: Generate hints for challenges
  generateHints: async (challengeId, userProgress) => {
    try {
      const prompt = `You are an expert mentor.

      Given the following challenge context and recent user progress, provide 3 concise, actionable hints (not solutions). Keep each hint under 2 sentences, and focus on nudging the learner.

      Return ONLY valid JSON:
      {
        "hints": ["hint 1", "hint 2", "hint 3"]
      }

      Challenge Context:
      ${userProgress.challengeContext || 'N/A'}

      Recent Feedback Highlights:
      ${(userProgress.lastFeedbackText || '').slice(0, 1000)}

      Targeted Improvements:
      ${
        Array.isArray(userProgress.improvements)
          ? userProgress.improvements.join(', ')
          : 'N/A'
      }
      `;

      const text = await callHF(prompt, 600);
      const jsonMatch = text && text.match && text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          hints: [
            'Review variable names and ensure consistency.',
            'Use comments to explain non-obvious logic.',
            'Test edge cases to strengthen robustness.',
          ],
        };
      }
      return JSON.parse(jsonMatch[0]);
    } catch (err) {
      Sentry.captureException(err);
      console.error('HF Hints Error:', err.message);
      return {
        hints: [
          'Break the problem into smaller steps.',
          'Check for off-by-one errors or missing conditions.',
          'Compare your approach with a simpler baseline.',
        ],
      };
    }
  },

  // TODO: Analyze learning patterns
  analyzePattern: async (userId, learningData) => {
    // Implementation needed
    throw new Error('Not implemented');
  },

  suggestNextChallenges: async (userId, goalId) => {
    try {
      let goalContext = '';

      if (goalId) {
        const goal = await prisma.goals.findFirst({
          where: { id: parseInt(goalId), userId: parseInt(userId) },
        });

        if (goal) {
          goalContext = `
          Goal:
          - Title: ${goal.title}
          - Description: ${goal.description || 'none'}
          - Category: ${goal.category || 'General'}
          - Difficulty: ${goal.difficulty || 'Medium'}
          `;
        }
      }

      const prompt = `
          You are an expert learning designer. Generate a unique, engaging challenge that helps the user achieve their goal.

          SUBMISSION CONSTRAINTS:
          - The platform ONLY accepts plain text or a single JavaScript file (.js).
          - Do NOT instruct the user to provide HTML, CSS, ZIP archives, images, or other file formats.

          Return ONLY valid JSON (no markdown, no code fences):
          {
            "title": "A unique, descriptive title for this specific challenge (not the goal title)",
            "description": "A compelling description explaining how completing this challenge will help achieve the goal and what skills they will develop",
            "instructions": "Clear, step-by-step instructions. End with: 'Submit a single .js file or paste your code as text.'",
            "category": "programming",
            "difficulty": "easy",
            "estimatedTimeMinutes": 30,
            "pointsReward": 50,
            "maxAttempts": 3
          }

          ${
            goalContext
              ? `Create a challenge that directly supports this goal:\n${goalContext}`
              : 'Create a helpful programming challenge.'
          }

          Make the title unique and specific to the challenge itself. The description should explain how this challenge helps achieve the goal while respecting submission constraints.
          `;

      const text = await callHF(prompt);
      const jsonMatch = text && text.match && text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // Fallback minimal challenge to avoid empty modal
        return {
          title: 'Practice Exercise',
          description: 'Complete a small task relevant to your goal.',
          instructions: 'Write a short summary of your learning today.',
          category: 'programming',
          difficulty: 'easy',
          estimatedTimeMinutes: 20,
          pointsReward: 10,
          maxAttempts: 3,
        };
      }

      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        Sentry.captureException(e);
        console.error('Failed to parse HF JSON for challenge:', text);
        throw e;
      }
    } catch (err) {
      Sentry.captureException(err);
      console.error('HF Challenge Suggest Error:', err);
      throw err;
    }
  },
};

module.exports = aiService;
