-- Generic update for Aceleración program scoring
-- This script updates all acceleration questions to have proper scores

-- First, let's check what questions exist
SELECT 
    q.id,
    q.text,
    q.score,
    p.name as program_name,
    b.name as block_name,
    q."order"
FROM questions q
LEFT JOIN programs p ON q."programId" = p.id
LEFT JOIN blocks b ON q."blockId" = b.id
WHERE p.name ILIKE '%aceler%'
ORDER BY b.name, q."order";

-- Update questions for Aceleración program
-- Assuming there are 3 questions per block and 5 blocks, totaling 15 questions
-- Target: 10 points total, so approximately 0.67 points per question on average

-- Method 1: Update all acceleration questions to have varied but appropriate scores
UPDATE questions 
SET score = CASE 
    WHEN questions."order" = 1 THEN 0.8  -- First question in each block gets higher score
    WHEN questions."order" = 2 THEN 0.7  -- Second question gets medium score
    WHEN questions."order" = 3 THEN 0.6  -- Third question gets lower score
    ELSE 0.5  -- Fallback
END
WHERE questions."programId" IN (
    SELECT p.id 
    FROM programs p 
    WHERE p.name ILIKE '%aceler%'
);

-- Verify the update
SELECT 
    p.name as program_name,
    SUM(q.score) as total_score,
    COUNT(q.id) as question_count,
    AVG(q.score) as avg_score
FROM questions q
LEFT JOIN programs p ON q."programId" = p.id
WHERE p.name ILIKE '%aceler%'
GROUP BY p.id, p.name;
