-- Add score column to questions table
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS score DECIMAL(3,2) DEFAULT 0.5;

-- Update existing questions with default scores based on program type
-- Incubación questions (assuming roughly 14-15 questions, total = 10 points)
-- Aceleración questions (assuming roughly 14-15 questions, total = 7.5 points)

-- For now, set default scores that can be customized later
UPDATE questions 
SET score = 0.5 
WHERE score IS NULL OR score = 0;
