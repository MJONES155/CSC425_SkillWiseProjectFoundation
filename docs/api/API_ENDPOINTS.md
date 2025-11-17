# SkillWise API Documentation

## Overview

This document outlines the RESTful API endpoints for the SkillWise application. The API follows REST conventions and returns JSON responses.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.skillwise.com/api`

## Authentication

- **Type**: JWT (JSON Web Tokens)
- **Headers**: `Authorization: Bearer <token>`
- **Cookies**: `refreshToken` (httpOnly, secure)

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2024-03-15T10:30:00Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": []
  },
  "timestamp": "2024-03-15T10:30:00Z"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Internal Server Error

---

## Authentication Endpoints

### POST /auth/register

Register a new user account.

**Request Body:**

```json
{
  "fullName": "John Smith",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "fullName": "John Smith",
      "email": "john@example.com",
      "createdAt": "2024-03-15T10:30:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Account created successfully"
}
```

### POST /auth/login

Authenticate user and receive access token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "fullName": "John Smith",
      "email": "john@example.com"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Login successful"
}
```

### POST /auth/logout

Logout user and invalidate refresh token.

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST /auth/refresh

Refresh access token using refresh token.

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Token refreshed"
}
```

---

## User Endpoints

### GET /users/profile

Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "fullName": "John Smith",
    "email": "john@example.com",
    "bio": "Learning JavaScript and loving it!",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2024-03-15T10:30:00Z",
    "stats": {
      "totalPoints": 2450,
      "challengesCompleted": 47,
      "currentStreak": 12,
      "averageScore": 87
    }
  }
}
```

### PUT /users/profile

Update user profile information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "fullName": "John Smith Jr.",
  "bio": "Passionate learner and developer",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

---

## Goals Endpoints

### GET /goals

Get all goals for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `status` - Filter by status (active, completed, paused)
- `category` - Filter by category
- `limit` - Number of results (default: 20)
- `offset` - Pagination offset

**Response:**

```json
{
  "success": true,
  "data": {
    "goals": [
      {
        "id": "goal_123",
        "title": "Learn JavaScript Basics",
        "description": "Master the fundamentals of JavaScript programming",
        "category": "Programming",
        "difficulty": "intermediate",
        "targetDate": "2024-04-15T00:00:00Z",
        "status": "active",
        "progress": 65,
        "challengeCount": 12,
        "completedChallenges": 8,
        "createdAt": "2024-03-01T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 5,
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### POST /goals

Create a new learning goal.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "title": "Learn React Hooks",
  "description": "Master React hooks and functional components",
  "category": "Programming",
  "difficulty": "intermediate",
  "targetDate": "2024-05-01T00:00:00Z",
  "autoGenerateChallenges": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "goal": {
      "id": "goal_456",
      "title": "Learn React Hooks",
      "status": "active",
      "progress": 0,
      "createdAt": "2024-03-15T10:30:00Z"
    }
  },
  "message": "Goal created successfully"
}
```

### GET /goals/:id

Get specific goal details.

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    "goal": {
      "id": "goal_123",
      "title": "Learn JavaScript Basics",
      "description": "Master the fundamentals of JavaScript programming",
      "category": "Programming",
      "difficulty": "intermediate",
      "targetDate": "2024-04-15T00:00:00Z",
      "status": "active",
      "progress": 65,
      "challenges": [
        {
          "id": "challenge_789",
          "title": "Variables and Data Types",
          "status": "completed",
          "difficulty": "beginner",
          "completedAt": "2024-03-10T15:20:00Z"
        }
      ]
    }
  }
}
```

### PUT /goals/:id

Update an existing goal.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "title": "Master JavaScript Fundamentals",
  "description": "Updated description",
  "targetDate": "2024-04-20T00:00:00Z",
  "status": "active"
}
```

### DELETE /goals/:id

Delete a goal and all associated challenges.

**Headers:** `Authorization: Bearer <token>`

---

## Challenges Endpoints

### GET /challenges

Get challenges for a specific goal or user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `goalId` - Filter by goal ID
- `status` - Filter by status (todo, in_progress, completed)
- `difficulty` - Filter by difficulty
- `limit` - Number of results
- `offset` - Pagination offset

**Response:**

```json
{
  "success": true,
  "data": {
    "challenges": [
      {
        "id": "challenge_789",
        "goalId": "goal_123",
        "title": "Variables and Data Types",
        "description": "Learn about JavaScript variables, strings, numbers...",
        "difficulty": "beginner",
        "status": "completed",
        "estimatedTime": "2-3 hours",
        "prerequisites": [],
        "resources": [
          {
            "title": "MDN Variables Guide",
            "url": "https://developer.mozilla.org/..."
          }
        ],
        "submission": {
          "id": "submission_456",
          "type": "code",
          "submittedAt": "2024-03-10T15:20:00Z",
          "score": 85
        }
      }
    ]
  }
}
```

### POST /challenges

Create a new challenge.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "goalId": "goal_123",
  "title": "Array Methods Practice",
  "description": "Practice using map, filter, and reduce methods",
  "difficulty": "intermediate",
  "estimatedTime": "3-4 hours",
  "prerequisites": ["challenge_789"],
  "resources": [
    {
      "title": "Array Methods Guide",
      "url": "https://example.com/guide"
    }
  ]
}
```

### GET /challenges/:id

Get specific challenge details.

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    "challenge": {
      "id": "challenge_789",
      "goalId": "goal_123",
      "title": "Variables and Data Types",
      "description": "Detailed challenge description...",
      "difficulty": "beginner",
      "status": "completed",
      "requirements": [
        "Create a global variable",
        "Demonstrate scope chain",
        "Include comments explaining behavior"
      ],
      "submission": {
        "id": "submission_456",
        "type": "code",
        "content": "// JavaScript code here...",
        "explanation": "This code demonstrates...",
        "submittedAt": "2024-03-10T15:20:00Z",
        "score": 85,
        "aiFeedback": {
          "positive": ["Clear variable naming", "Good structure"],
          "improvements": ["Add error handling", "Consider edge cases"],
          "suggestions": ["Try implementing closure example"]
        }
      }
    }
  }
}
```

---

## Submissions Endpoints

### POST /submissions

Submit work for a challenge.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "challengeId": "challenge_789",
  "type": "code",
  "content": "// JavaScript code here...",
  "explanation": "This code demonstrates scope chain by..."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "submission": {
      "id": "submission_456",
      "challengeId": "challenge_789",
      "type": "code",
      "content": "// JavaScript code here...",
      "explanation": "This code demonstrates scope chain by...",
      "submittedAt": "2024-03-15T10:30:00Z",
      "status": "submitted"
    }
  },
  "message": "Submission created successfully"
}
```

### GET /submissions/:id

Get specific submission details.

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    "submission": {
      "id": "submission_456",
      "challengeId": "challenge_789",
      "type": "code",
      "content": "// JavaScript code here...",
      "submittedAt": "2024-03-15T10:30:00Z",
      "score": 85,
      "aiFeedback": {
        "overall": "Great work! Your solution demonstrates...",
        "positive": ["Clear variable naming"],
        "improvements": ["Add error handling"],
        "suggestions": ["Try implementing closure example"]
      },
      "peerReviews": [
        {
          "id": "review_123",
          "rating": 4,
          "feedback": "Good solution with clear comments",
          "reviewedAt": "2024-03-15T14:20:00Z"
        }
      ]
    }
  }
}
```

---

## AI Endpoints

### POST /ai/generate-challenges

Generate AI challenges for a goal.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "goalId": "goal_123",
  "count": 3,
  "difficulty": "intermediate",
  "focusAreas": ["functions", "scope", "closures"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "challenges": [
      {
        "title": "Closure Practice",
        "description": "Create functions that demonstrate closure concepts",
        "difficulty": "intermediate",
        "estimatedTime": "2-3 hours",
        "requirements": [
          "Create a function that returns another function",
          "Demonstrate variable persistence in closure"
        ]
      }
    ]
  }
}
```

### POST /ai/feedback

Get AI feedback on a submission.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "submissionId": "submission_456"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "feedback": {
      "overall": "Great work! Your solution demonstrates good understanding...",
      "score": 85,
      "positive": [
        "Clear variable naming",
        "Good code structure",
        "Proper commenting"
      ],
      "improvements": [
        "Add error handling for edge cases",
        "Consider performance optimizations"
      ],
      "suggestions": [
        "Try implementing this using arrow functions",
        "Explore the use of const vs let"
      ]
    }
  }
}
```

### POST /ai/explain

Get AI explanation for a concept.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "concept": "JavaScript closures",
  "level": "beginner",
  "context": "I'm learning about scope and need help understanding closures"
}
```

---

## Progress Endpoints

### GET /progress/dashboard

Get dashboard data for the user.

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalPoints": 2450,
      "challengesCompleted": 47,
      "currentStreak": 12,
      "averageScore": 87,
      "rank": 15
    },
    "recentActivity": [
      {
        "type": "challenge_completed",
        "challengeTitle": "DOM Manipulation",
        "score": 92,
        "timestamp": "2024-03-15T10:30:00Z"
      }
    ],
    "weeklyProgress": [
      { "day": "Monday", "challenges": 2 },
      { "day": "Tuesday", "challenges": 1 },
      { "day": "Wednesday", "challenges": 3 }
    ],
    "goalProgress": [
      {
        "goalId": "goal_123",
        "title": "Learn JavaScript",
        "progress": 65,
        "daysLeft": 5
      }
    ]
  }
}
```

### GET /progress/goals/:goalId

Get detailed progress for a specific goal.

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    "goal": {
      "id": "goal_123",
      "title": "Learn JavaScript Basics",
      "progress": 65,
      "totalChallenges": 12,
      "completedChallenges": 8,
      "averageScore": 87,
      "timeSpent": "24 hours",
      "milestones": [
        {
          "title": "Variables Mastery",
          "completed": true,
          "completedAt": "2024-03-10T15:20:00Z"
        },
        {
          "title": "Functions Expert",
          "completed": false,
          "progress": 60
        }
      ]
    }
  }
}
```

---

## Leaderboard Endpoints

### GET /leaderboard

Get leaderboard data.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `scope` - global, friends, category
- `timeframe` - all_time, this_week, this_month
- `category` - programming, design, etc.
- `limit` - Number of results (default: 50)

**Response:**

```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "userId": "user_456",
        "username": "Sarah Chen",
        "avatar": "https://example.com/avatar.jpg",
        "points": 4250,
        "challengesCompleted": 85,
        "averageScore": 94
      }
    ],
    "userRank": {
      "rank": 15,
      "points": 2450,
      "percentile": 78
    }
  }
}
```

---

## Peer Review Endpoints

### GET /reviews

Get peer reviews for the user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

- `type` - to_review, given, received
- `status` - pending, completed
- `limit` - Number of results

**Response:**

```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "review_123",
        "submissionId": "submission_789",
        "challengeTitle": "JavaScript Functions",
        "type": "to_review",
        "assignedAt": "2024-03-15T08:00:00Z",
        "deadline": "2024-03-16T08:00:00Z",
        "status": "pending"
      }
    ]
  }
}
```

### POST /reviews

Submit a peer review.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "submissionId": "submission_789",
  "rating": 4,
  "positives": "Great code structure and clear comments",
  "improvements": "Could add error handling",
  "specificFeedback": "The variable naming is excellent...",
  "criteria": {
    "meetsRequirements": true,
    "wellCommented": true,
    "goodNaming": true,
    "considersEdgeCases": false
  }
}
```

---

## Rate Limiting

All endpoints are rate limited:

- **Authentication**: 5 requests per minute
- **General API**: 100 requests per minute
- **AI endpoints**: 10 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1615802400
```

## Error Codes

### Authentication Errors

- `AUTH_INVALID_CREDENTIALS` - Invalid email/password
- `AUTH_TOKEN_EXPIRED` - Access token expired
- `AUTH_TOKEN_INVALID` - Invalid or malformed token
- `AUTH_USER_NOT_FOUND` - User account not found

### Validation Errors

- `VALIDATION_REQUIRED_FIELD` - Required field missing
- `VALIDATION_INVALID_FORMAT` - Invalid field format
- `VALIDATION_MIN_LENGTH` - Field too short
- `VALIDATION_MAX_LENGTH` - Field too long

### Business Logic Errors

- `GOAL_NOT_FOUND` - Goal not found
- `CHALLENGE_NOT_FOUND` - Challenge not found
- `CHALLENGE_ALREADY_COMPLETED` - Challenge already completed
- `INSUFFICIENT_PERMISSIONS` - User lacks permission
- `DUPLICATE_SUBMISSION` - Submission already exists

### AI Service Errors

- `AI_SERVICE_UNAVAILABLE` - AI service temporarily unavailable
- `AI_QUOTA_EXCEEDED` - AI usage quota exceeded
- `AI_INVALID_PROMPT` - Invalid prompt format

This API documentation provides a comprehensive guide for frontend developers to integrate with the SkillWise backend services.
