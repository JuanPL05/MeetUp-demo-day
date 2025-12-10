import { type NextRequest, NextResponse } from "next/server"
import { executeQuery, handleDatabaseError } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, description } = body

    console.log("[v0] Updating team:", params.id, { name, description })

    const query = `
      UPDATE teams 
      SET name = $1, description = $2, "updatedAt" = NOW() 
      WHERE id = $3 
      RETURNING *
    `

    const result = await executeQuery(query, [name, description, params.id])

    if (result.length === 0) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    const team = result[0]
    console.log("[v0] Team updated successfully:", team.id)
    return NextResponse.json(team)
  } catch (error) {
    console.error("[v0] Error updating team:", error)
    return handleDatabaseError(error, "Failed to update team")
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] Deleting team:", params.id)

    const query = `DELETE FROM teams WHERE id = $1 RETURNING id`
    const result = await executeQuery(query, [params.id])

    if (result.length === 0) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    console.log("[v0] Team deleted successfully:", params.id)
    return NextResponse.json({ message: "Team deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting team:", error)
    return handleDatabaseError(error, "Failed to delete team")
  }
}
