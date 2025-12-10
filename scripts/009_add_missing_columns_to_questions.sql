-- Add missing columns to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS "programId" TEXT;

-- Add foreign key constraint for programId if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'questions_programId_fkey'
    ) THEN
        ALTER TABLE questions ADD CONSTRAINT questions_programId_fkey 
        FOREIGN KEY ("programId") REFERENCES programs(id);
    END IF;
END $$;

-- Add category column to judges if it doesn't exist
ALTER TABLE judges ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Jurados nacionales';

-- Update existing judges with categories if they don't have them
UPDATE judges SET category = 'Jurados nacionales' WHERE category IS NULL;
