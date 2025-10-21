const db = require('../database/connection');

class Challenge {
  static async findAll() {
    try {
      const query = 'SELECT * FROM challenges ORDER BY difficulty, created_at DESC';
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding challenges: ${error.message}`);
    }
  }

  static async findById(challengeId) {
    try {
      const query = 'SELECT * FROM challenges WHERE id = $1';
      const result = await db.query(query, [challengeId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding challenge: ${error.message}`);
    }
  }

  static async findByDifficulty(difficulty) {
    try {
      const query = 'SELECT * FROM challenges WHERE difficulty = $1 ORDER BY created_at DESC';
      const result = await db.query(query, [difficulty]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding challenges by difficulty: ${error.message}`);
    }
  }

  static async findBySubject(subject) {
    try {
      const query = 'SELECT * FROM challenges WHERE subject = $1 ORDER BY difficulty, created_at DESC';
      const result = await db.query(query, [subject]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding challenges by subject: ${error.message}`);
    }
  }

  static async create(challengeData) {
    try {
      const { title, description, difficulty, subject, points, type, content } = challengeData;
      const query = `
        INSERT INTO challenges (title, description, difficulty, subject, points, type, content, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *
      `;
      const result = await db.query(query, [title, description, difficulty, subject, points, type, content]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating challenge: ${error.message}`);
    }
  }

  static async update(challengeId, updateData) {
    try {
      const { title, description, difficulty, subject, points, type, content } = updateData;
      const query = `
        UPDATE challenges 
        SET title = COALESCE($2, title),
            description = COALESCE($3, description),
            difficulty = COALESCE($4, difficulty),
            subject = COALESCE($5, subject),
            points = COALESCE($6, points),
            type = COALESCE($7, type),
            content = COALESCE($8, content),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;
      const result = await db.query(query, [challengeId, title, description, difficulty, subject, points, type, content]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating challenge: ${error.message}`);
    }
  }

  static async delete(challengeId) {
    try {
      const query = 'DELETE FROM challenges WHERE id = $1 RETURNING *';
      const result = await db.query(query, [challengeId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting challenge: ${error.message}`);
    }
  }
}

module.exports = Challenge;