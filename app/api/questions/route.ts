import { type NextRequest, NextResponse } from "next/server"
import { executeQuery, handleDatabaseError } from "@/lib/database"

export async function GET() {
  try {
    console.log("[v0] Fetching questions with blocks and programs...")

    let hasProgramId = false
    let hasDescription = false
    let hasScore = false // Added score column check

    try {
      const programIdCheck = await executeQuery(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'questions' AND column_name = 'programId'
      `)
      hasProgramId = programIdCheck.length > 0

      const descriptionCheck = await executeQuery(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'questions' AND column_name = 'description'
      `)
      hasDescription = descriptionCheck.length > 0

      const scoreCheck = await executeQuery(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'questions' AND column_name = 'score'
      `)
      hasScore = scoreCheck.length > 0
    } catch (columnCheckError) {
      console.log("[v0] Column check failed, using fallback query")
    }

    let query = ""

    if (hasProgramId && hasDescription && hasScore) {
      query = `
        SELECT 
          q.id,
          q.text,
          q.description,
          q.score,
          q."blockId",
          q."programId",
          q."order",
          q."createdAt",
          q."updatedAt",
          b.id as block_id,
          b.name as block_name,
          p.id as program_id,
          p.name as program_name
        FROM questions q
        LEFT JOIN blocks b ON q."blockId" = b.id
        LEFT JOIN programs p ON q."programId" = p.id
        ORDER BY p.name ASC, b."order" ASC, q."order" ASC
      `
    } else if (hasProgramId && hasDescription) {
      // Both columns exist, use full query
      query = `
        SELECT 
          q.id,
          q.text,
          q.description,
          q."blockId",
          q."programId",
          q."order",
          q."createdAt",
          q."updatedAt",
          b.id as block_id,
          b.name as block_name,
          p.id as program_id,
          p.name as program_name
        FROM questions q
        LEFT JOIN blocks b ON q."blockId" = b.id
        LEFT JOIN programs p ON q."programId" = p.id
        ORDER BY p.name ASC, b."order" ASC, q."order" ASC
      `
    } else if (hasDescription) {
      // Only description exists
      query = `
        SELECT 
          q.id,
          q.text,
          q.description,
          q."blockId",
          q."order",
          q."createdAt",
          q."updatedAt",
          b.id as block_id,
          b.name as block_name
        FROM questions q
        LEFT JOIN blocks b ON q."blockId" = b.id
        ORDER BY b."order" ASC, q."order" ASC
      `
    } else {
      // Neither column exists, use basic query
      query = `
        SELECT 
          q.id,
          q.text,
          q."blockId",
          q."order",
          q."createdAt",
          q."updatedAt",
          b.id as block_id,
          b.name as block_name
        FROM questions q
        LEFT JOIN blocks b ON q."blockId" = b.id
        ORDER BY b."order" ASC, q."order" ASC
      `
    }

    const result = await executeQuery(query)

    // Transform the result to match the expected format
    const questions = result.map((row: any) => ({
      id: row.id,
      text: row.text,
      description: hasDescription ? row.description || null : null,
      score: hasScore ? row.score || 0.5 : 0.5, // Include score field with default value
      blockId: row.blockId,
      programId: hasProgramId ? row.programId || null : null,
      order: row.order,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      block: row.block_id
        ? {
            id: row.block_id,
            name: row.block_name,
          }
        : null,
      program:
        hasProgramId && row.program_id
          ? {
              id: row.program_id,
              name: row.program_name,
            }
          : null,
    }))

    console.log("[v0] Questions fetched successfully:", questions.length)
    return NextResponse.json(questions)
  } catch (error) {
    console.error("[v0] Error fetching questions:", error)
    return handleDatabaseError(error, "Failed to fetch questions")
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, description, blockId, programId, order, score } = body // Added score to destructuring

    console.log("[v0] Creating question:", { text, description, blockId, programId, order, score })

    let hasProgramId = false
    let hasDescription = false
    let hasScore = false // Added score column check

    try {
      const programIdCheck = await executeQuery(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'questions' AND column_name = 'programId'
      `)
      hasProgramId = programIdCheck.length > 0

      const descriptionCheck = await executeQuery(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'questions' AND column_name = 'description'
      `)
      hasDescription = descriptionCheck.length > 0

      const scoreCheck = await executeQuery(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'questions' AND column_name = 'score'
      `)
      hasScore = scoreCheck.length > 0
    } catch (columnCheckError) {
      console.log("[v0] Column check failed, using fallback")
    }

    let query = ""
    let params = []

    if (hasProgramId && hasDescription && hasScore) {
      query = `
        INSERT INTO questions (text, description, score, "blockId", "programId", "order", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *
      `
      params = [text, description || null, score || 0.5, blockId, programId, order]
    } else if (hasProgramId && hasDescription) {
      query = `
        INSERT INTO questions (text, description, "blockId", "programId", "order", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *
      `
      params = [text, description || null, blockId, programId, order]
    } else if (hasDescription) {
      query = `
        INSERT INTO questions (text, description, "blockId", "order", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *
      `
      params = [text, description || null, blockId, order]
    } else if (hasProgramId) {
      query = `
        INSERT INTO questions (text, "blockId", "programId", "order", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *
      `
      params = [text, blockId, programId, order]
    } else {
      query = `
        INSERT INTO questions (text, "blockId", "order", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING *
      `
      params = [text, blockId, order]
    }

    const result = await executeQuery(query, params)
    const newQuestion = result[0]

    // Fetch the block information
    const blockQuery = `SELECT id, name FROM blocks WHERE id = $1`
    const blockResult = await executeQuery(blockQuery, [blockId])
    const block = blockResult[0]

    let program = null
    if (hasProgramId && programId) {
      const programQuery = `SELECT id, name FROM programs WHERE id = $1`
      const programResult = await executeQuery(programQuery, [programId])
      program = programResult[0]
    }

    const questionWithRelations = {
      ...newQuestion,
      description: hasDescription ? newQuestion.description : null,
      score: hasScore ? newQuestion.score : score || 0.5, // Include score in response
      programId: hasProgramId ? newQuestion.programId : null,
      block: {
        id: block.id,
        name: block.name,
      },
      program: program
        ? {
            id: program.id,
            name: program.name,
          }
        : null,
    }

    console.log("[v0] Question created successfully:", questionWithRelations.id)
    return NextResponse.json(questionWithRelations, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating question:", error)
    return handleDatabaseError(error, "Failed to create question")
  }
}
