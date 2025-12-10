import { type NextRequest, NextResponse } from "next/server"
import { executeQuery, handleDatabaseError } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, description, order } = body

    const query =
      'UPDATE blocks SET name = $1, description = $2, "order" = $3, "updatedAt" = NOW() WHERE id = $4 RETURNING *'
    const queryParams = [name, description || null, order, params.id]

    console.log("[v0] Executing query:", query, "with params:", queryParams)
    const result = await executeQuery(query, queryParams)

    if (result.length === 0) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 })
    }

    const block = result[0]
    console.log("[v0] Block updated successfully:", block)
    return NextResponse.json(block)
  } catch (error: any) {
    console.error("[v0] Query execution failed:", { error: error.message })
    return handleDatabaseError(error, "Failed to update block")
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const query = "DELETE FROM blocks WHERE id = $1 RETURNING id"
    const queryParams = [params.id]

    console.log("[v0] Executing query:", query, "with params:", queryParams)
    const result = await executeQuery(query, queryParams)

    if (result.length === 0) {
      return NextResponse.json({ error: "Block not found" }, { status: 404 })
    }

    console.log("[v0] Block deleted successfully:", params.id)
    return NextResponse.json({ message: "Block deleted successfully" })
  } catch (error: any) {
    console.error("[v0] Query execution failed:", { error: error.message })
    return handleDatabaseError(error, "Failed to delete block")
  }
}
