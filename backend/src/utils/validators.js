// TODO: Data validation utility functions
const { z } = require('zod');

// TODO: Email validation
const validateEmail = (email) => {
  const emailSchema = z.string().email();
  return emailSchema.safeParse(email).success;
};

// TODO: Password validation
const validatePassword = (password) => {
  const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
    .regex(/^(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .regex(/^(?=.*\d)/, 'Password must contain at least one number')
    .regex(/^(?=.*[@$!%*?&])/, 'Password must contain at least one special character');
  
  const result = passwordSchema.safeParse(password);
  return {
    isValid: result.success,
    errors: result.success ? [] : result.error.errors.map(e => e.message)
  };
};

// TODO: Username validation
const validateUsername = (username) => {
  const usernameSchema = z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');
  
  return usernameSchema.safeParse(username).success;
};

// TODO: Phone number validation
const validatePhoneNumber = (phone) => {
  const phoneSchema = z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format');
  
  return phoneSchema.safeParse(phone).success;
};

// TODO: URL validation
const validateUrl = (url) => {
  const urlSchema = z.string().url();
  return urlSchema.safeParse(url).success;
};

// TODO: Date validation
const validateDate = (date) => {
  const dateSchema = z.string().datetime();
  return dateSchema.safeParse(date).success;
};

// TODO: MongoDB ObjectId validation
const validateObjectId = (id) => {
  const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');
  return objectIdSchema.safeParse(id).success;
};

// TODO: Sanitize input to prevent XSS
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// TODO: Validate file upload
const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
  } = options;

  const errors = [];

  if (file.size > maxSize) {
    errors.push(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
  }

  if (!allowedTypes.includes(file.mimetype)) {
    errors.push(`File type ${file.mimetype} not allowed`);
  }

  const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
  if (!allowedExtensions.includes(ext)) {
    errors.push(`File extension ${ext} not allowed`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername,
  validatePhoneNumber,
  validateUrl,
  validateDate,
  validateObjectId,
  sanitizeString,
  validateFileUpload
};