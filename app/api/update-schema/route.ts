export async function POST() {
  try {
    const { executeQuery } = await import("@/lib/database")

    console.log("[v0] Starting database schema update...")

    // Add missing columns to questions table
    await executeQuery(`
      ALTER TABLE questions 
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS "programId" TEXT
    `)

    // Add score column if it doesn't exist
    await executeQuery(`
      ALTER TABLE questions 
      ADD COLUMN IF NOT EXISTS score NUMERIC(3,2) DEFAULT 0.5
    `)

    // Update score constraint to allow 0.2 - 1.2 range
    console.log("[v0] Updating score constraint to 0.2 - 1.2 range...")
    
    // Drop existing score constraint
    await executeQuery(`
      ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_score_range
    `)
    
    // Add new constraint with extended range
    await executeQuery(`
      ALTER TABLE questions ADD CONSTRAINT questions_score_range 
      CHECK (score >= 0.2 AND score <= 1.2)
    `)
    
    console.log("[v0] Score constraint updated to allow 0.2 - 1.2 range")

    // Add missing column to judges table
    await executeQuery(`
      ALTER TABLE judges 
      ADD COLUMN IF NOT EXISTS category TEXT
    `)

    const constraintExists = await executeQuery(`
      SELECT COUNT(*) as count
      FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_questions_program' 
      AND table_name = 'questions'
    `)

    if (constraintExists[0].count === 0) {
      await executeQuery(`
        ALTER TABLE questions 
        ADD CONSTRAINT fk_questions_program 
        FOREIGN KEY ("programId") REFERENCES programs(id)
      `)
      console.log("[v0] Foreign key constraint added successfully")
    } else {
      console.log("[v0] Foreign key constraint already exists, skipping")
    }

    console.log("[v0] Database schema updated successfully")

    return Response.json({
      success: true,
      message: "Database schema updated successfully - Score range now 0.2 - 1.2",
    })
  } catch (error) {
    console.error("[v0] Schema update error:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
