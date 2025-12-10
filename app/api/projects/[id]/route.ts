import { type NextRequest, NextResponse } from "next/server"
import { executeQuery, handleDatabaseError } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, description, programId, teamId } = body

    console.log("[v0] Updating project:", params.id, { name, description, programId, teamId })

    const query = `
      UPDATE projects 
      SET name = $1, description = $2, "programId" = $3, "teamId" = $4, "updatedAt" = NOW() 
      WHERE id = $5 
      RETURNING *
    `

    const result = await executeQuery(query, [name, description, programId, teamId, params.id])

    if (result.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const updatedProject = result[0]

    // Fetch the program and team information
    const programQuery = `SELECT id, name FROM programs WHERE id = $1`
    const teamQuery = `SELECT id, name FROM teams WHERE id = $1`

    const [programResult, teamResult] = await Promise.all([
      executeQuery(programQuery, [programId]),
      executeQuery(teamQuery, [teamId]),
    ])

    const projectWithRelations = {
      ...updatedProject,
      program: {
        id: programResult[0]?.id,
        name: programResult[0]?.name,
      },
      team: {
        id: teamResult[0]?.id,
        name: teamResult[0]?.name,
      },
    }

    console.log("[v0] Project updated successfully:", projectWithRelations.id)
    return NextResponse.json(projectWithRelations)
  } catch (error) {
    console.error("[v0] Error updating project:", error)
    return handleDatabaseError(error, "Failed to update project")
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] Deleting project:", params.id)

    const query = `DELETE FROM projects WHERE id = $1 RETURNING id`
    const result = await executeQuery(query, [params.id])

    if (result.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    console.log("[v0] Project deleted successfully:", params.id)
    return NextResponse.json({ message: "Project deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting project:", error)
    return handleDatabaseError(error, "Failed to delete project")
  }
}
