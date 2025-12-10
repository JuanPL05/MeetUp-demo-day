import { type NextRequest, NextResponse } from "next/server"
import { executeQuery, handleDatabaseError } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { text, description, blockId, programId, order, score } = body // Added score to destructuring

    console.log("[v0] Updating question:", params.id, { text, description, blockId, programId, order, score })
    console.log("[v0] Score value type and range check:", typeof score, score, "within 0.2-1.0:", score >= 0.2 && score <= 1.0)

    const columnCheckQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'questions' AND table_schema = 'public'
    `
    const columnResult = await executeQuery(columnCheckQuery, [])
    const existingColumns = columnResult.map((row) => row.column_name)

    console.log("[v0] Available columns:", existingColumns)

    const hasDescription = existingColumns.includes("description")
    const hasProgramId = existingColumns.includes("programId")
    const hasScore = existingColumns.includes("score") // Added score column check

    console.log("[v0] Column flags:", { hasDescription, hasProgramId, hasScore })

    const updateFields = []
    const queryParams = []
    let paramIndex = 1

    // Always include text
    updateFields.push(`text = $${paramIndex}`)
    queryParams.push(text)
    paramIndex++

    // Add description if column exists
    if (hasDescription) {
      updateFields.push(`description = $${paramIndex}`)
      queryParams.push(description || null)
      paramIndex++
    }

    if (hasScore) {
      updateFields.push(`score = $${paramIndex}`)
      queryParams.push(score || 0.5)
      paramIndex++
    }

    // Always include blockId
    updateFields.push(`"blockId" = $${paramIndex}`)
    queryParams.push(blockId)
    paramIndex++

    // Add programId if column exists
    if (hasProgramId) {
      updateFields.push(`"programId" = $${paramIndex}`)
      queryParams.push(programId)
      paramIndex++
    }

    // Always include order and updatedAt
    updateFields.push(`"order" = $${paramIndex}`)
    queryParams.push(order)
    paramIndex++

    updateFields.push('"updatedAt" = NOW()')

    // Add WHERE clause parameter
    queryParams.push(params.id)

    const query = `
      UPDATE questions 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    console.log("[v0] Executing update query:", query)
    console.log("[v0] Query parameters:", queryParams)

    const result = await executeQuery(query, queryParams)

    console.log("[v0] Update result:", result.length > 0 ? "Success" : "No rows affected", result.length > 0 ? result[0] : "No data")

    if (result.length === 0) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    const updatedQuestion = result[0]

    const blockQuery = `SELECT id, name FROM blocks WHERE id = $1`
    const blockResult = await executeQuery(blockQuery, [blockId])
    const block = blockResult[0]

    const questionWithRelations = {
      ...updatedQuestion,
      block: block
        ? {
            id: block.id,
            name: block.name,
          }
        : null,
    }

    if (hasProgramId && programId) {
      const programQuery = `SELECT id, name FROM programs WHERE id = $1`
      const programResult = await executeQuery(programQuery, [programId])
      const program = programResult[0]

      questionWithRelations.program = program
        ? {
            id: program.id,
            name: program.name,
          }
        : null
    }

    console.log("[v0] Question updated successfully:", questionWithRelations.id)
    return NextResponse.json(questionWithRelations)
  } catch (error) {
    console.error("[v0] Error updating question:", error)
    return handleDatabaseError(error, "Failed to update question")
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] Deleting question:", params.id)

    // First check if question exists
    const checkQuery = `SELECT id, text FROM questions WHERE id = $1`
    const checkResult = await executeQuery(checkQuery, [params.id])
    
    console.log("[v0] Question exists check:", checkResult.length > 0 ? "Found" : "Not found", checkResult.length > 0 ? checkResult[0] : "No data")

    if (checkResult.length === 0) {
      console.log("[v0] Question not found for deletion:", params.id)
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    const query = `DELETE FROM questions WHERE id = $1 RETURNING id`
    console.log("[v0] Executing delete query:", query, "with param:", params.id)
    
    const result = await executeQuery(query, [params.id])

    console.log("[v0] Delete result:", result.length > 0 ? "Success" : "No rows affected", result.length > 0 ? result[0] : "No data")

    if (result.length === 0) {
      return NextResponse.json({ error: "Question could not be deleted" }, { status: 500 })
    }

    console.log("[v0] Question deleted successfully:", params.id)
    return NextResponse.json({ message: "Question deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting question:", error)
    return handleDatabaseError(error, "Failed to delete question")
  }
}
