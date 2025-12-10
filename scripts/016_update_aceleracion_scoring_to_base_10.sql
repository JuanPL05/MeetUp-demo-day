-- Update Aceleración program scoring from 7.5 to 10 points base
-- This script adjusts the scores of all acceleration questions to total 10 points

-- Update acceleration questions scores to total 10 points
-- New distribution: 2.0 points per block (instead of 1.5)

UPDATE questions 
SET score = CASE 
    -- Innovación block - Total 2.0 points (was 1.5)
    WHEN id = 'q_acc_inn_1' THEN 0.8  -- was 0.6
    WHEN id = 'q_acc_inn_2' THEN 0.5  -- was 0.4  
    WHEN id = 'q_acc_inn_3' THEN 0.7  -- was 0.5
    
    -- Mercado block - Total 2.0 points (was 1.5)
    WHEN id = 'q_acc_mer_1' THEN 0.8  -- was 0.6
    WHEN id = 'q_acc_mer_2' THEN 0.7  -- was 0.5
    WHEN id = 'q_acc_mer_3' THEN 0.5  -- was 0.4
    
    -- Equipo block - Total 2.0 points (was 1.5)  
    WHEN id = 'q_acc_equ_1' THEN 0.8  -- was 0.6
    WHEN id = 'q_acc_equ_2' THEN 0.5  -- was 0.4
    WHEN id = 'q_acc_equ_3' THEN 0.7  -- was 0.5
    
    -- Modelo de Negocio block - Total 2.0 points (was 1.5)
    WHEN id = 'q_acc_mod_1' THEN 0.8  -- was 0.6
    WHEN id = 'q_acc_mod_2' THEN 0.5  -- was 0.4
    WHEN id = 'q_acc_mod_3' THEN 0.7  -- was 0.5
    
    -- Financiero block - Total 2.0 points (was 1.5)
    WHEN id = 'q_acc_fin_1' THEN 0.7  -- was 0.5
    WHEN id = 'q_acc_fin_2' THEN 0.7  -- was 0.5
    WHEN id = 'q_acc_fin_3' THEN 0.6  -- was 0.5
    
    ELSE score -- Keep existing score for all other questions
END
WHERE "programId" = 'prog_aceleracion';

-- Verify the update
SELECT 
    p.name as program_name,
    b.name as block_name,
    q.text,
    q.score,
    q.id
FROM questions q
JOIN programs p ON q."programId" = p.id
JOIN blocks b ON q."blockId" = b.id
WHERE p.name LIKE '%Aceleración%'
ORDER BY b.name, q."order";

-- Show totals by program and block
SELECT 
    p.name as program_name,
    b.name as block_name,
    SUM(q.score) as block_total,
    COUNT(q.id) as question_count
FROM questions q
JOIN programs p ON q."programId" = p.id
JOIN blocks b ON q."blockId" = b.id
WHERE p.name LIKE '%Aceleración%'
GROUP BY p.id, p.name, b.id, b.name
ORDER BY b.name;

-- Show total by program
SELECT 
    p.name as program_name,
    SUM(q.score) as program_total,
    COUNT(q.id) as total_questions
FROM questions q
JOIN programs p ON q."programId" = p.id
GROUP BY p.id, p.name
ORDER BY p.name;
