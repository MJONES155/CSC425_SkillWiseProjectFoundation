-- TODO: Create user statistics table for performance metrics
-- Migration 009: Create user statistics table

CREATE TABLE IF NOT EXISTS user_statistics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  total_challenges_completed INTEGER DEFAULT 0,
  total_goals_completed INTEGER DEFAULT 0,
  total_peer_reviews_given INTEGER DEFAULT 0,
  total_peer_reviews_received INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  total_time_spent_minutes INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  rank_position INTEGER,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_user_stats_total_points ON user_statistics(total_points DESC);
CREATE INDEX idx_user_stats_level ON user_statistics(level DESC);
CREATE INDEX idx_user_stats_rank ON user_statistics(rank_position);
CREATE INDEX idx_user_stats_activity ON user_statistics(last_activity_date);

-- Create trigger for updated_at
CREATE TRIGGER update_user_statistics_updated_at BEFORE UPDATE ON user_statistics
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();