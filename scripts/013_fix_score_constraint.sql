-- Fix the questions score constraint to allow range 0.2 to 1.0
-- Drop old constraint and create new one with correct range

-- Drop the existing constraint
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_score_range;

-- Add the new constraint with correct range (0.2 to 1.0)
ALTER TABLE questions ADD CONSTRAINT questions_score_range 
CHECK (score >= 0.2 AND score <= 1.0);
