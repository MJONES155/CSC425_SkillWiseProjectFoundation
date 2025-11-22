// TODO: Request validation middleware using Zod schemas
const { z } = require('zod');
const { AppError } = require('./errorHandler');
const jwt = require('jsonwebtoken');

// TODO: Validation schemas
const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const registerSchema = z.object({
  body: z
    .object({
      email: z.string().email('Invalid email format'),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          'Password must contain at least one lowercase letter, one uppercase letter, and one number',
        ),
      firstName: z
        .string()
        .min(1, 'First name is required')
        .max(50, 'First name too long'),
      lastName: z
        .string()
        .min(1, 'Last name is required')
        .max(50, 'Last name too long'),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords don\'t match',
      path: ['confirmPassword'],
    }),
});

const goalSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Goal title is required')
      .max(255, 'Title too long'),
    description: z.string().optional(),
    category: z.string().optional(),
    difficulty: z
      .enum(['easy', 'medium', 'hard', 'Easy', 'Medium', 'Hard'])
      .default('medium'),
    // Accept date-only strings like 'YYYY-MM-DD' or full ISO datetime
    targetCompletionDate: z.string().optional(),
  }),
});

const goalUpdateSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Goal title is required')
      .max(255, 'Title too long')
      .optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    difficulty: z
      .enum(['easy', 'medium', 'hard', 'Easy', 'Medium', 'Hard', 'paused'])
      .optional(),
    targetCompletionDate: z.string().optional(),
    isCompleted: z.boolean().optional(),
    progressPercentage: z.coerce.number().int().min(0).max(100).optional(),
    pointsReward: z.coerce.number().int().min(0).optional(),
    isPublic: z.boolean().optional(),
  }),
});

const challengeSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Challenge title is required')
      .max(255, 'Title too long'),
    description: z.string().min(1, 'Description is required'),
    instructions: z.string().min(1, 'Instructions are required'),
    category: z.string().optional(),
    difficulty: z
      .enum(['easy', 'medium', 'hard', 'Easy', 'Medium', 'Hard'])
      .optional(),
    estimatedTimeMinutes: z.coerce
      .number()
      .int()
      .positive()
      .optional()
      .nullable(),
    pointsReward: z.coerce.number().int().positive().optional().nullable(),
    maxAttempts: z.coerce.number().int().positive().optional().nullable(),
    // Optional linkage to a goal, validated in service
    goalId: z.coerce.number().int().positive().optional().nullable(),
    // Optional array of prerequisite challenge IDs
    prerequisites: z
      .array(z.union([z.coerce.number().int().positive(), z.string()]))
      .optional(),
  }),
});

const challengeUpdateSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Challenge title is required')
      .max(255, 'Title too long')
      .optional(),
    description: z.string().min(1, 'Description is required').optional(),
    instructions: z.string().min(1, 'Instructions are required').optional(),
    category: z.string().optional(),
    difficulty: z
      .enum(['easy', 'medium', 'hard', 'Easy', 'Medium', 'Hard'])
      .optional(),
    estimatedTimeMinutes: z.coerce
      .number()
      .int()
      .positive()
      .optional()
      .nullable(),
    pointsReward: z.coerce.number().int().positive().optional().nullable(),
    maxAttempts: z.coerce.number().int().positive().optional().nullable(),
    goalId: z.coerce.number().int().positive().optional().nullable(),
    prerequisites: z
      .array(z.union([z.coerce.number().int().positive(), z.string()]))
      .optional(),
  }),
});

// TODO: Generic validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validationData = {
        body: req.body,
        query: req.query,
        params: req.params,
      };

      const result = schema.safeParse(validationData);

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return next(
          new AppError(
            `Validation error: ${errors.map((e) => e.message).join(', ')}`,
            400,
            'VALIDATION_ERROR',
          ),
        );
      }

      // Attach validated data to request
      req.validated = result.data;
      next();
    } catch (error) {
      next(new AppError('Validation error', 400, 'VALIDATION_ERROR'));
    }
  };
};

// TODO: Specific validation middleware functions
const loginValidation = validate(loginSchema);
const registerValidation = validate(registerSchema);
const goalValidation = validate(goalSchema);
const goalUpdateValidation = validate(goalUpdateSchema);
const challengeValidation = validate(challengeSchema);
const challengeUpdateValidation = validate(challengeUpdateSchema);

module.exports = {
  validate,
  loginValidation,
  registerValidation,
  goalValidation,
  goalUpdateValidation,
  challengeValidation,
  challengeUpdateValidation,
  // Export schemas for testing
  schemas: {
    loginSchema,
    registerSchema,
    goalSchema,
    goalUpdateSchema,
    challengeSchema,
    challengeUpdateSchema,
  },
};
