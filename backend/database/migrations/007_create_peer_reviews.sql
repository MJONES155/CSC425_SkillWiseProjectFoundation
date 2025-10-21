-- TODO: Create peer reviews table for student peer evaluation
-- Migration 007: Create peer reviews table

CREATE TABLE IF NOT EXISTS peer_reviews (
  id SERIAL PRIMARY KEY,
  reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  review_text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  criteria_scores JSONB,
  time_spent_minutes INTEGER,
  is_anonymous BOOLEAN DEFAULT true,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_peer_reviews_reviewer_id ON peer_reviews(reviewer_id);
CREATE INDEX idx_peer_reviews_reviewee_id ON peer_reviews(reviewee_id);
CREATE INDEX idx_peer_reviews_submission_id ON peer_reviews(submission_id);
CREATE INDEX idx_peer_reviews_is_completed ON peer_reviews(is_completed);
CREATE UNIQUE INDEX idx_peer_reviews_unique ON peer_reviews(reviewer_id, submission_id);

-- Create trigger for updated_at
CREATE TRIGGER update_peer_reviews_updated_at BEFORE UPDATE ON peer_reviews
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();