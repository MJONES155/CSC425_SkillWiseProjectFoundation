-- TODO: Create AI feedback table for AI-generated responses
-- Migration 006: Create AI feedback table

CREATE TABLE IF NOT EXISTS ai_feedback (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  feedback_text TEXT NOT NULL,
  feedback_type VARCHAR(50) DEFAULT 'general',
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  suggestions TEXT[],
  strengths TEXT[],
  improvements TEXT[],
  ai_model VARCHAR(50),
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_ai_feedback_submission_id ON ai_feedback(submission_id);
CREATE INDEX idx_ai_feedback_type ON ai_feedback(feedback_type);
CREATE INDEX idx_ai_feedback_created_at ON ai_feedback(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_ai_feedback_updated_at BEFORE UPDATE ON ai_feedback
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();