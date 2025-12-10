ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_score_range;
ALTER TABLE questions ADD CONSTRAINT questions_score_range CHECK (score >= 0.2 AND score <= 1.2);
