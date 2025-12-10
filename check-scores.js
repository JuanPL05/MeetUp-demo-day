const { executeQuery } = require('./lib/database')

async function checkQuestionScores() {
  try {
    // Check if score column exists
    const scoreColumnCheck = await executeQuery(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'questions' AND column_name = 'score'
    `)
    console.log('Score column exists:', scoreColumnCheck.length > 0)
    
    // Get all questions with their scores
    const questions = await executeQuery(`
      SELECT 
        q.id,
        q.text,
        q.score,
        p.name as program_name,
        b.name as block_name
      FROM questions q
      LEFT JOIN programs p ON q."programId" = p.id
      LEFT JOIN blocks b ON q."blockId" = b.id
      ORDER BY p.name, b.name, q."order"
    `)
    
    console.log('\n=== QUESTION SCORES ===')
    questions.forEach(q => {
      console.log(`${q.program_name} - ${q.block_name}: ${q.text.substring(0, 50)}... | Score: ${q.score}`)
    })
    
    // Group by program
    const scoresByProgram = questions.reduce((acc, q) => {
      const program = q.program_name || 'Sin programa'
      if (!acc[program]) acc[program] = []
      acc[program].push(q.score || 0)
      return acc
    }, {})
    
    console.log('\n=== TOTALS BY PROGRAM ===')
    Object.entries(scoresByProgram).forEach(([program, scores]) => {
      const total = scores.reduce((sum, score) => sum + score, 0)
      console.log(`${program}: ${total} points (${scores.length} questions)`)
    })
    
    process.exit(0)
    
  } catch (error) {
    console.error('Error checking question scores:', error)
    process.exit(1)
  }
}

checkQuestionScores()
