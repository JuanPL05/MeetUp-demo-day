-- Fix evaluations table score column to support decimal values
-- Change from integer to numeric(3,2) to support scores like 0.48

-- First, check if the column exists and get its current type
DO $$
BEGIN
    -- Change the score column from integer to numeric to support decimal values
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'evaluations' 
        AND column_name = 'score'
        AND data_type = 'integer'
    ) THEN
        -- Convert existing integer scores to decimal format
        ALTER TABLE evaluations ALTER COLUMN score TYPE NUMERIC(4,2);
        
        RAISE NOTICE 'Successfully changed evaluations.score column from integer to numeric(4,2)';
    ELSE
        RAISE NOTICE 'Evaluations.score column is already numeric or does not exist';
    END IF;
END $$;
