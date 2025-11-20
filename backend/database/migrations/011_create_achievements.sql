-- TODO: Create achievements table for user accomplishments
-- Migration 011: Create achievements table

CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  badge_icon VARCHAR(255),
  points_reward INTEGER DEFAULT 0,
  criteria JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  rarity VARCHAR(20) DEFAULT 'common', -- common, rare, epic, legendary
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User achievements junction table
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  progress_data JSONB,
  is_displayed BOOLEAN DEFAULT true
);

-- Create indexes for achievements
CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_rarity ON achievements(rarity);
CREATE INDEX idx_achievements_is_active ON achievements(is_active);

-- Create indexes for user_achievements
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_earned_at ON user_achievements(earned_at);
CREATE UNIQUE INDEX idx_user_achievements_unique ON user_achievements(user_id, achievement_id);

-- Create triggers for updated_at
CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();