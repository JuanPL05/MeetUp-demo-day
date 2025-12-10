-- Add score column to questions table if it doesn't exist
DO $$ 
BEGIN
    -- Add score column to questions table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questions' AND column_name = 'score'
    ) THEN
        ALTER TABLE questions ADD COLUMN score DECIMAL(3,2) DEFAULT 0.5;
        COMMENT ON COLUMN questions.score IS 'Maximum score for this question (0.3 to 0.8)';
    END IF;
END $$;

-- Update existing questions with default scores based on program type
UPDATE questions 
SET score = CASE 
    WHEN EXISTS (
        SELECT 1 FROM programs p 
        WHERE p.id = questions."programId" 
        AND p.name LIKE '%Incubación%'
    ) THEN 0.5  -- Default for incubation questions
    WHEN EXISTS (
        SELECT 1 FROM programs p 
        WHERE p.id = questions."programId" 
        AND p.name LIKE '%Aceleración%'
    ) THEN 0.4  -- Default for acceleration questions  
    ELSE 0.5    -- Default fallback
END
WHERE score IS NULL OR score = 0.5;
