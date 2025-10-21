const db = require('../database/connection');

class Progress {
  static async findByUserId(userId) {
    try {
      const query = 'SELECT * FROM progress WHERE user_id = $1 ORDER BY created_at DESC';
      const result = await db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding progress for user: ${error.message}`);
    }
  }

  static async findByUserAndChallenge(userId, challengeId) {
    try {
      const query = 'SELECT * FROM progress WHERE user_id = $1 AND challenge_id = $2';
      const result = await db.query(query, [userId, challengeId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding progress: ${error.message}`);
    }
  }

  static async getUserStats(userId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_attempts,
          COUNT(CASE WHEN completed = true THEN 1 END) as completed_challenges,
          SUM(points_earned) as total_points,
          AVG(CASE WHEN completed = true THEN score END) as average_score
        FROM progress 
        WHERE user_id = $1
      `;
      const result = await db.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error getting user stats: ${error.message}`);
    }
  }

  static async create(progressData) {
    try {
      const { user_id, challenge_id, score, completed, points_earned, time_spent } = progressData;
      const query = `
        INSERT INTO progress (user_id, challenge_id, score, completed, points_earned, time_spent, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *
      `;
      const result = await db.query(query, [user_id, challenge_id, score, completed, points_earned, time_spent]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating progress: ${error.message}`);
    }
  }

  static async update(progressId, updateData) {
    try {
      const { score, completed, points_earned, time_spent } = updateData;
      const query = `
        UPDATE progress 
        SET score = COALESCE($2, score),
            completed = COALESCE($3, completed),
            points_earned = COALESCE($4, points_earned),
            time_spent = COALESCE($5, time_spent),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;
      const result = await db.query(query, [progressId, score, completed, points_earned, time_spent]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating progress: ${error.message}`);
    }
  }

  static async getLeaderboardData(limit = 10) {
    try {
      const query = `
        SELECT 
          u.id,
          u.username,
          u.first_name,
          u.last_name,
          SUM(p.points_earned) as total_points,
          COUNT(CASE WHEN p.completed = true THEN 1 END) as challenges_completed
        FROM users u
        LEFT JOIN progress p ON u.id = p.user_id
        GROUP BY u.id, u.username, u.first_name, u.last_name
        ORDER BY total_points DESC, challenges_completed DESC
        LIMIT $1
      `;
      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting leaderboard data: ${error.message}`);
    }
  }
}

module.exports = Progress;