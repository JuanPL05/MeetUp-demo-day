-- Add score column to questions table if it doesn't exist
DO $$ 
BEGIN
    -- Add score column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questions' AND column_name = 'score'
    ) THEN
        ALTER TABLE questions ADD COLUMN score DECIMAL(3,2) DEFAULT 0.5;
        
        -- Update existing questions with default scores based on program
        UPDATE questions 
        SET score = CASE 
            WHEN "programId" = 'prog_incubation' THEN 0.5
            WHEN "programId" = 'prog_acceleration' THEN 0.4
            ELSE 0.5
        END;
        
        -- Add constraint to ensure score is between 0.2 and 0.8
        ALTER TABLE questions ADD CONSTRAINT questions_score_range 
        CHECK (score >= 0.2 AND score <= 0.8);
    END IF;
END $$;
