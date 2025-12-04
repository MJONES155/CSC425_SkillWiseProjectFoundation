## 💻 SLIDE 7: Code Walkthrough

### Code Example 1: AI Prompt Engineering - Challenge Generation

**File**: `backend/src/services/aiService.js` (suggestNextChallenges)

````javascript
// ============================================================================
// AI-POWERED CHALLENGE GENERATION - Uses Hugging Face API to create challenges
// ============================================================================

/**
 * suggestNextChallenges - Generates a new challenge using AI based on user's goal
 *
 * WHY THIS IS IMPORTANT:
 * - Converts abstract goal "Learn React" into concrete, actionable challenges
 * - Uses careful prompt engineering to ensure consistent, valid responses
 * - Handles multiple response formats from different AI models
 * - Provides fallback challenge if AI fails
 */
const suggestNextChallenges = async (userId, goalId) => {
  try {
    // ========== FETCH GOAL CONTEXT ==========
    // We need to understand what the user is trying to learn
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

    // ========== CRAFT THE AI PROMPT ==========
    // This prompt is carefully designed to:
    // 1. Ensure JSON output only (no markdown)
    // 2. Specify exact fields needed
    // 3. Include constraints (file type: .js only)
    // 4. Provide context about the goal
    const prompt = `
        You are an expert learning designer. Generate a unique, engaging challenge.

        CRITICAL: The platform ONLY accepts plain text or .js files.
        Do NOT instruct the user to provide HTML, CSS, ZIP, images, etc.

        Return ONLY valid JSON (no markdown, no code fences):
        {
          "title": "A unique, descriptive title for this specific challenge",
          "description": "Compelling description of what they'll learn",
          "instructions": "Clear step-by-step instructions. End with: 'Submit a single .js file or paste your code as text.'",
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

        Make the title unique and specific to the challenge itself.
    `;

    // ========== CALL AI API ==========
    // Using Hugging Face API (compatible with OpenAI format)
    const text = await callHF(prompt);

    // ========== EXTRACT JSON FROM RESPONSE ==========
    // AI might return markdown code fences: ```json { ... } ```
    // We extract just the JSON object
    const jsonMatch = text && text.match && text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      // If AI doesn't return JSON, use fallback challenge
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

    // ========== PARSE AND RETURN ==========
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      // JSON parsing failed - log for debugging
      Sentry.captureException(e);
      console.error('Failed to parse HF JSON for challenge:', text);
      throw e;
    }
  } catch (err) {
    // Network error or API failure
    Sentry.captureException(err);
    console.error('HF Challenge Suggest Error:', err);
    throw err;
  }
};
````

### Code Example 2: AI Feedback with Learning History - Production-Ready Prompt

**File**: `backend/src/services/aiService.js` (generateFeedback)

```javascript
// ============================================================================
// AI FEEDBACK GENERATION - Intelligent grading that recognizes improvement
// ============================================================================

/**
 * generateFeedback - Creates detailed feedback on student submissions
 *
 * IMPORTANT FEATURES:
 * - Includes previous attempt history to recognize improvement
 * - Scores based on actual quality (not placeholder values)
 * - Rewards progress made since earlier attempts
 * - Returns structured JSON for consistent app integration
 *
 * THIS WAS YOUR INITIATIVE - You crafted this prompt to make AI feedback smarter!
 */
const generateFeedback = async (
  submissionText,
  challengeContext,
  previousAttempts = []
) => {
  try {
    // ========== BUILD HISTORY CONTEXT ==========
    // If student has attempted this before, include their history
    // This allows AI to recognize improvement and give credit
    let historyContext = '';
    if (previousAttempts.length > 0) {
      historyContext =
        '\n\nPREVIOUS SUBMISSION HISTORY (for context and progress tracking):';

      previousAttempts.forEach((attempt, idx) => {
        historyContext += `\n\nAttempt ${attempt.attemptNumber || idx + 1}:`;
        historyContext += `\nScore: ${attempt.score || 'N/A'}`;

        if (attempt.feedback) {
          historyContext += `\nPrevious feedback: ${
            attempt.feedback.feedbackText || ''
          }`;

          // Include what improvements were suggested
          if (
            attempt.feedback.improvements &&
            attempt.feedback.improvements.length > 0
          ) {
            historyContext += `\nSuggested improvements: ${attempt.feedback.improvements.join(
              '; '
            )}`;
          }
        }
      });

      // KEY INSTRUCTION: Recognize and reward improvement!
      historyContext +=
        '\n\nIMPORTANT: Recognize improvements made since earlier attempts. ' +
        'If the learner addressed previous feedback, acknowledge progress and award higher scores accordingly. ' +
        'Do not penalize for issues already fixed.';
    }

    // ========== CRAFT THE FEEDBACK PROMPT ==========
    // This prompt is carefully engineered to produce consistent, useful feedback
    const prompt = `You are an expert mentor providing detailed, constructive feedback.

      Analyze the submission and provide comprehensive feedback in JSON format (ONLY return valid JSON, no markdown):

      {
        "feedbackText": "A detailed paragraph with specific examples",
        "feedbackType": "general",
        "confidenceScore": <0.0 to 1.0>,
        "overallScore": <0-100>,
        "strengths": ["Strength 1", "Strength 2", "Strength 3"],
        "improvements": ["Area 1", "Area 2", "Area 3"],
        "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
        "processingTimeMs": 0
      }

      Context:
      ${challengeContext || 'N/A'}
      ${historyContext}

      CURRENT SUBMISSION:
      ${submissionText}

      CRITICAL SCORING INSTRUCTIONS:
      - Evaluate "overallScore" based on ACTUAL submission quality. DO NOT use placeholder values.
      - Scale: 90-100 (exceptional), 80-89 (excellent), 70-79 (good), 60-69 (adequate), 50-59 (needs work), <50 (poor).
      - Assess: correctness, code quality, efficiency, readability, best practices.
      - IF previous attempts exist: REWARD IMPROVEMENT! Increase score to reflect learning progress.
      - Vary scores meaningfully based on what you observe.

      Provide detailed, specific feedback with concrete examples.`;

    // ========== CALL AI API ==========
    const start = Date.now();
    let output = await callHF(prompt, 2500); // Extended token limit for detailed feedback
    output = output.trim();

    // ========== EXTRACT JSON ==========
    // AI response might include markdown, extract just the JSON
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : null;

    let obj;
    try {
      obj = JSON.parse(jsonText);
    } catch (e) {
      // Parsing failed - return graceful fallback
      Sentry.captureException(e);
      console.error('Failed to parse AI response:', output);
      return {
        feedbackText: 'Unable to generate structured feedback.',
        feedbackType: 'general',
        confidenceScore: 0,
        overallScore: 50, // Neutral score if we can't parse
        strengths: [],
        improvements: [],
        suggestions: [],
        processingTimeMs: Date.now() - start,
      };
    }

    // ========== ADD METADATA ==========
    // Track how long the AI took to generate this feedback
    obj.processingTimeMs = Date.now() - start;

    return obj;
  } catch (err) {
    // Network error or timeout
    Sentry.captureException(err);
    console.error('AI Feedback Error:', err.message);

    // Return fallback feedback instead of crashing
    return {
      feedbackText: 'Error while generating AI feedback.',
      feedbackType: 'general',
      confidenceScore: 0,
      overallScore: 50,
      strengths: [],
      improvements: [],
      suggestions: [],
      processingTimeMs: null,
    };
  }
};
```
