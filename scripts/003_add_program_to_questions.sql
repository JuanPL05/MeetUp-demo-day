-- Adding program categorization to questions
-- Add programId column to questions table
ALTER TABLE questions ADD COLUMN "programId" TEXT;

-- Set default program for existing questions (assuming first program is incubation)
UPDATE questions SET "programId" = (
  SELECT id FROM programs ORDER BY "createdAt" ASC LIMIT 1
) WHERE "programId" IS NULL;

-- Make programId required
ALTER TABLE questions ALTER COLUMN "programId" SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE questions ADD CONSTRAINT "questions_programId_fkey" 
FOREIGN KEY ("programId") REFERENCES programs(id) ON DELETE CASCADE;
