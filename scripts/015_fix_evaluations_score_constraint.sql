-- Fix evaluations table score constraint to allow decimal scores
-- Drop the old constraint that only allowed integer values (1-5)
-- Add new constraint that allows decimal scores (0.0-1.0)

-- Drop the existing constraint if it exists
ALTER TABLE evaluations DROP CONSTRAINT IF EXISTS evaluations_score_check;

-- Add new constraint that allows decimal scores from 0.0 to 1.0
ALTER TABLE evaluations ADD CONSTRAINT evaluations_score_check 
CHECK (score >= 0.0 AND score <= 1.0);

-- Update the score column type to ensure it can handle decimals
ALTER TABLE evaluations ALTER COLUMN score TYPE NUMERIC(4,2);
