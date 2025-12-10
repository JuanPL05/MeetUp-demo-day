-- Add missing columns to existing tables
ALTER TABLE questions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS "programId" INTEGER;
ALTER TABLE judges ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Nacional';

-- Add foreign key constraint for questions.programId
ALTER TABLE questions ADD CONSTRAINT fk_questions_program 
FOREIGN KEY ("programId") REFERENCES programs(id) ON DELETE SET NULL;
