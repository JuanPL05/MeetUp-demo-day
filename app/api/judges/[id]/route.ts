import { type NextRequest, NextResponse } from "next/server"
import { executeQuery, handleDatabaseError } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, email } = body

    console.log("[v0] Updating judge:", params.id, { name, email })

    const query = `
      UPDATE judges 
      SET name = $1, email = $2, "updatedAt" = NOW() 
      WHERE id = $3 
      RETURNING *
    `

    const result = await executeQuery(query, [name, email, params.id])

    if (result.length === 0) {
      return NextResponse.json({ error: "Judge not found" }, { status: 404 })
    }

    const judge = result[0]
    console.log("[v0] Judge updated successfully:", judge.id)
    return NextResponse.json(judge)
  } catch (error) {
    console.error("[v0] Error updating judge:", error)
    return handleDatabaseError(error, "Failed to update judge")
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] Deleting judge:", params.id)

    const query = `DELETE FROM judges WHERE id = $1 RETURNING id`
    const result = await executeQuery(query, [params.id])

    if (result.length === 0) {
      return NextResponse.json({ error: "Judge not found" }, { status: 404 })
    }

    console.log("[v0] Judge deleted successfully:", params.id)
    return NextResponse.json({ message: "Judge deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting judge:", error)
    return handleDatabaseError(error, "Failed to delete judge")
  }
}
