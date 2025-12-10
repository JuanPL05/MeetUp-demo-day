import { type NextRequest, NextResponse } from "next/server"
import { executeQuery, handleDatabaseError } from "@/lib/database"

export async function GET() {
  try {
    console.log("[v0] Fetching projects with programs and teams...")

    const query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p."programId",
        p."teamId",
        p."createdAt",
        p."updatedAt",
        pr.id as program_id,
        pr.name as program_name,
        t.id as team_id,
        t.name as team_name
      FROM projects p
      LEFT JOIN programs pr ON p."programId" = pr.id
      LEFT JOIN teams t ON p."teamId" = t.id
      ORDER BY p."createdAt" DESC
    `

    const result = await executeQuery(query)

    // Transform the result to match the expected format
    const projects = result.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      programId: row.programId,
      teamId: row.teamId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      program: {
        id: row.program_id,
        name: row.program_name,
      },
      team: {
        id: row.team_id,
        name: row.team_name,
      },
    }))

    console.log("[v0] Projects fetched successfully:", projects.length)
    return NextResponse.json(projects)
  } catch (error) {
    console.error("[v0] Error fetching projects:", error)
    return handleDatabaseError(error, "Failed to fetch projects")
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, programId, teamId } = body

    console.log("[v0] Creating project:", { name, description, programId, teamId })

    const query = `
      INSERT INTO projects (name, description, "programId", "teamId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `

    const result = await executeQuery(query, [name, description, programId, teamId])
    const newProject = result[0]

    // Fetch the program and team information
    const programQuery = `SELECT id, name FROM programs WHERE id = $1`
    const teamQuery = `SELECT id, name FROM teams WHERE id = $1`

    const [programResult, teamResult] = await Promise.all([
      executeQuery(programQuery, [programId]),
      executeQuery(teamQuery, [teamId]),
    ])

    const projectWithRelations = {
      ...newProject,
      program: {
        id: programResult[0]?.id,
        name: programResult[0]?.name,
      },
      team: {
        id: teamResult[0]?.id,
        name: teamResult[0]?.name,
      },
    }

    console.log("[v0] Project created successfully:", projectWithRelations.id)
    return NextResponse.json(projectWithRelations, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating project:", error)
    return handleDatabaseError(error, "Failed to create project")
  }
}
