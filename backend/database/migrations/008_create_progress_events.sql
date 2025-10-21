-- TODO: Create progress events table for tracking learning activities
-- Migration 008: Create progress events table

CREATE TABLE IF NOT EXISTS progress_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  points_earned INTEGER DEFAULT 0,
  related_goal_id INTEGER REFERENCES goals(id),
  related_challenge_id INTEGER REFERENCES challenges(id),
  related_submission_id INTEGER REFERENCES submissions(id),
  session_id VARCHAR(255),
  timestamp_occurred TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_progress_events_user_id ON progress_events(user_id);
CREATE INDEX idx_progress_events_type ON progress_events(event_type);
CREATE INDEX idx_progress_events_goal_id ON progress_events(related_goal_id);
CREATE INDEX idx_progress_events_challenge_id ON progress_events(related_challenge_id);
CREATE INDEX idx_progress_events_timestamp ON progress_events(timestamp_occurred);
CREATE INDEX idx_progress_events_session ON progress_events(session_id);

-- Create GIN index for event_data JSONB
CREATE INDEX idx_progress_events_data ON progress_events USING GIN(event_data);