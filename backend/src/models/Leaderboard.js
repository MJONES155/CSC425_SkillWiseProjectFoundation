const db = require('../database/connection');

class Leaderboard {
  static async getGlobalLeaderboard (limit = 10) {
    try {
      const query = `
        SELECT 
          u.id,
          u.username,
          u.first_name,
          u.last_name,
          SUM(p.points_earned) as total_points,
          COUNT(CASE WHEN p.completed = true THEN 1 END) as challenges_completed,
          AVG(CASE WHEN p.completed = true THEN p.score END) as average_score,
          u.created_at as join_date
        FROM users u
        LEFT JOIN progress p ON u.id = p.user_id
        WHERE u.active = true
        GROUP BY u.id, u.username, u.first_name, u.last_name, u.created_at
        ORDER BY total_points DESC, challenges_completed DESC, average_score DESC
        LIMIT $1
      `;
      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting global leaderboard: ${error.message}`);
    }
  }

  static async getWeeklyLeaderboard (limit = 10) {
    try {
      const query = `
        SELECT 
          u.id,
          u.username,
          u.first_name,
          u.last_name,
          SUM(p.points_earned) as weekly_points,
          COUNT(CASE WHEN p.completed = true THEN 1 END) as weekly_completions
        FROM users u
        LEFT JOIN progress p ON u.id = p.user_id
        WHERE u.active = true 
        AND p.created_at >= DATE_TRUNC('week', CURRENT_DATE)
        GROUP BY u.id, u.username, u.first_name, u.last_name
        ORDER BY weekly_points DESC, weekly_completions DESC
        LIMIT $1
      `;
      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting weekly leaderboard: ${error.message}`);
    }
  }

  static async getMonthlyLeaderboard (limit = 10) {
    try {
      const query = `
        SELECT 
          u.id,
          u.username,
          u.first_name,
          u.last_name,
          SUM(p.points_earned) as monthly_points,
          COUNT(CASE WHEN p.completed = true THEN 1 END) as monthly_completions
        FROM users u
        LEFT JOIN progress p ON u.id = p.user_id
        WHERE u.active = true 
        AND p.created_at >= DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY u.id, u.username, u.first_name, u.last_name
        ORDER BY monthly_points DESC, monthly_completions DESC
        LIMIT $1
      `;
      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting monthly leaderboard: ${error.message}`);
    }
  }

  static async getUserRank (userId) {
    try {
      const query = `
        WITH user_rankings AS (
          SELECT 
            u.id,
            SUM(p.points_earned) as total_points,
            RANK() OVER (ORDER BY SUM(p.points_earned) DESC) as rank
          FROM users u
          LEFT JOIN progress p ON u.id = p.user_id
          WHERE u.active = true
          GROUP BY u.id
        )
        SELECT rank, total_points
        FROM user_rankings
        WHERE id = $1
      `;
      const result = await db.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error getting user rank: ${error.message}`);
    }
  }

  static async getSubjectLeaderboard (subject, limit = 10) {
    try {
      const query = `
        SELECT 
          u.id,
          u.username,
          u.first_name,
          u.last_name,
          SUM(p.points_earned) as subject_points,
          COUNT(CASE WHEN p.completed = true THEN 1 END) as subject_completions
        FROM users u
        LEFT JOIN progress p ON u.id = p.user_id
        LEFT JOIN challenges c ON p.challenge_id = c.id
        WHERE u.active = true 
        AND c.subject = $1
        GROUP BY u.id, u.username, u.first_name, u.last_name
        ORDER BY subject_points DESC, subject_completions DESC
        LIMIT $2
      `;
      const result = await db.query(query, [subject, limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting subject leaderboard: ${error.message}`);
    }
  }
}

module.exports = Leaderboard;
