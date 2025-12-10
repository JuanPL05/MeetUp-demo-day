import { type NextRequest, NextResponse } from "next/server"
import { executeQuery, handleDatabaseError } from "@/lib/database"

export async function GET(request: NextRequest) {
  console.log("[v0] Evaluations API: GET request received")

  const { searchParams } = new URL(request.url)
  const judgeId = searchParams.get("judgeId")
  const projectId = searchParams.get("projectId")

  console.log("[v0] Evaluations API: Query params - judgeId:", judgeId, "projectId:", projectId)

  try {
    let query = `
      SELECT 
        e.id,
        e.score,
        e."judgeId",
        e."projectId", 
        e."questionId",
        e."createdAt",
        e."updatedAt",
        j.id as judge_id,
        j.name as judge_name,
        p.id as project_id,
        p.name as project_name,
        t.id as team_id,
        t.name as team_name,
        q.id as question_id,
        q.text as question_text,
        q."order" as question_order,
        b.id as block_id,
        b.name as block_name,
        b."order" as block_order
      FROM evaluations e
      LEFT JOIN judges j ON e."judgeId" = j.id
      LEFT JOIN projects p ON e."projectId" = p.id
      LEFT JOIN teams t ON p."teamId" = t.id
      LEFT JOIN questions q ON e."questionId" = q.id
      LEFT JOIN blocks b ON q."blockId" = b.id
    `

    const params = []
    const conditions = []

    if (judgeId) {
      conditions.push(`e."judgeId" = $${params.length + 1}`)
      params.push(judgeId)
    }

    if (projectId) {
      conditions.push(`e."projectId" = $${params.length + 1}`)
      params.push(projectId)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`
    }

    query += ` ORDER BY b."order" ASC, q."order" ASC`

    console.log("[v0] Evaluations API: Executing query with params:", params)
    const result = await executeQuery(query, params)

    const evaluations = result.map((row: any) => ({
      id: row.id,
      score: row.score,
      judgeId: row.judgeId,
      projectId: row.projectId,
      questionId: row.questionId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      judge: {
        id: row.judge_id,
        name: row.judge_name,
      },
      project: {
        id: row.project_id,
        name: row.project_name,
        team: {
          id: row.team_id,
          name: row.team_name,
        },
      },
      question: {
        id: row.question_id,
        text: row.question_text,
        order: row.question_order,
        block: {
          id: row.block_id,
          name: row.block_name,
          order: row.block_order,
        },
      },
    }))

    console.log("[v0] Evaluations API: Successfully fetched", evaluations.length, "evaluations")
    return NextResponse.json(evaluations)
  } catch (error) {
    console.error("[v0] Evaluations API: Error fetching evaluations:", error)
    return handleDatabaseError(error, "Failed to fetch evaluations")
  }
}

export async function POST(request: NextRequest) {
  console.log("[v0] Evaluations API: POST request received")

  try {
    const body = await request.json()
    const { score, judgeId, projectId, questionId } = body

    const roundedScore = Math.round(score * 100) / 100

    console.log("[v0] Evaluations API: Creating/updating evaluation:", {
      score: roundedScore,
      judgeId,
      projectId,
      questionId,
    })

    try {
      // First, try to drop the old constraint if it exists
      await executeQuery(
        `
        ALTER TABLE evaluations 
        DROP CONSTRAINT IF EXISTS evaluations_score_check
      `,
        [],
      )

      // No need to convert scores - we now store star ratings directly (1-5)
      // Just ensure any invalid scores are within range
      await executeQuery(
        `
        UPDATE evaluations 
        SET score = CASE 
          WHEN score > 5.0 THEN 5.0
          WHEN score < 1.0 THEN 1.0
          ELSE score
        END
        WHERE score > 5.0 OR score < 1.0
      `,
        [],
      )

      await executeQuery(
        `
        ALTER TABLE evaluations 
        ADD CONSTRAINT evaluations_score_check 
        CHECK (score >= 1.0 AND score <= 5.0)
      `,
        [],
      )

      console.log("[v0] Evaluations API: Updated score constraint to allow star ratings 1-5")
    } catch (constraintError) {
      console.log("[v0] Evaluations API: Constraint already updated or error:", constraintError)
    }

    const query = `
      INSERT INTO evaluations (score, "judgeId", "projectId", "questionId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT ("judgeId", "projectId", "questionId")
      DO UPDATE SET 
        score = EXCLUDED.score,
        "updatedAt" = NOW()
      RETURNING *
    `

    const params = [roundedScore, judgeId, projectId, questionId]
    const result = await executeQuery(query, params)

    if (result.length === 0) {
      throw new Error("Failed to create or update evaluation")
    }

    const detailQuery = `
      SELECT 
        e.id,
        e.score,
        e."judgeId",
        e."projectId", 
        e."questionId",
        e."createdAt",
        e."updatedAt",
        j.id as judge_id,
        j.name as judge_name,
        p.id as project_id,
        p.name as project_name,
        q.id as question_id,
        q.text as question_text
      FROM evaluations e
      LEFT JOIN judges j ON e."judgeId" = j.id
      LEFT JOIN projects p ON e."projectId" = p.id
      LEFT JOIN questions q ON e."questionId" = q.id
      WHERE e.id = $1
    `

    const detailResult = await executeQuery(detailQuery, [result[0].id])

    if (detailResult.length === 0) {
      throw new Error("Failed to fetch created evaluation details")
    }

    const evaluation = {
      id: detailResult[0].id,
      score: detailResult[0].score,
      judgeId: detailResult[0].judgeId,
      projectId: detailResult[0].projectId,
      questionId: detailResult[0].questionId,
      createdAt: detailResult[0].createdAt,
      updatedAt: detailResult[0].updatedAt,
      judge: {
        id: detailResult[0].judge_id,
        name: detailResult[0].judge_name,
      },
      project: {
        id: detailResult[0].project_id,
        name: detailResult[0].project_name,
      },
      question: {
        id: detailResult[0].question_id,
        text: detailResult[0].question_text,
      },
    }

    console.log("[v0] Evaluations API: Successfully created/updated evaluation:", evaluation.id)
    return NextResponse.json(evaluation, { status: 201 })
  } catch (error) {
    console.error("[v0] Evaluations API: Error creating/updating evaluation:", error)
    return handleDatabaseError(error, "Failed to create or update evaluation")
  }
}
