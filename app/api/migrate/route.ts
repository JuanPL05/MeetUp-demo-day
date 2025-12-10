import { NextResponse } from "next/server"
import { executeQuery, handleDatabaseError } from "@/lib/database"

export async function POST() {
  try {
    console.log("[v0] Starting Generic Aceleración scoring migration...")

    // First, let's see what questions we have for Aceleración
    const checkQuery = `
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
      ORDER BY b.name, q."order"
    `
    
    const currentQuestions = await executeQuery(checkQuery)
    console.log(`[v0] Found ${currentQuestions.length} questions for Aceleración program`)

    // Update all acceleration questions with varied scores
    // Using a pattern-based approach: first question = 0.8, second = 0.7, third = 0.6, etc.
    const updateQuery = `
      UPDATE questions 
      SET score = CASE 
          WHEN q."order" = 1 THEN 0.8  -- First question in each block
          WHEN q."order" = 2 THEN 0.7  -- Second question
          WHEN q."order" = 3 THEN 0.6  -- Third question
          WHEN q."order" = 4 THEN 0.5  -- Fourth question if exists
          ELSE 0.5  -- Fallback
      END
      FROM programs p, blocks b
      WHERE questions."programId" = p.id 
        AND questions."blockId" = b.id
        AND p.name ILIKE '%aceler%'
    `

    const result = await executeQuery(updateQuery)
    console.log("[v0] Migration completed")

    // Verify the update
    const verificationResult = await executeQuery(checkQuery)

    // Show totals by program
    const totalsQuery = `
      SELECT 
          p.name as program_name,
          SUM(q.score) as program_total,
          COUNT(q.id) as total_questions,
          AVG(q.score) as avg_score_per_question
      FROM questions q
      LEFT JOIN programs p ON q."programId" = p.id
      WHERE p.name ILIKE '%aceler%'
      GROUP BY p.id, p.name
    `

    const totalsResult = await executeQuery(totalsQuery)

    return NextResponse.json({
      success: true,
      message: "Generic Aceleración scoring migration completed successfully",
      details: {
        questionsFound: currentQuestions.length,
        updatedQuestions: verificationResult,
        programTotals: totalsResult
      }
    })

  } catch (error) {
    console.error("[v0] Migration error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Migration failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Generic Aceleración Scoring Migration Endpoint",
    description: "POST to this endpoint to update acceleration program scoring with varied values",
    usage: "Send POST request to /api/migrate"
  })
}
