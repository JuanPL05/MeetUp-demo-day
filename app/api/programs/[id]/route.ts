import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, description } = body

    const result = await executeQuery(
      `UPDATE programs SET name = $1, description = $2, "updatedAt" = NOW() WHERE id = $3 RETURNING *`,
      [name, description, params.id],
    )

    if (result.length === 0) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("[v0] Error updating program:", error)
    return NextResponse.json({ error: "Failed to update program" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await executeQuery(`DELETE FROM programs WHERE id = $1 RETURNING id`, [params.id])

    if (result.length === 0) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Program deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting program:", error)
    return NextResponse.json({ error: "Failed to delete program" }, { status: 500 })
  }
}
