import { type NextRequest, NextResponse } from "next/server"
import { executeQuery, handleDatabaseError } from "@/lib/database"

export async function GET() {
  try {
    const programs = await executeQuery('SELECT * FROM programs ORDER BY "createdAt" DESC')

    console.log("[v0] Programs fetched successfully:", programs.length)
    return NextResponse.json(programs)
  } catch (error) {
    console.error("[v0] Programs GET error:", error)
    const { message, status } = handleDatabaseError(error, "Failed to fetch programs")
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name || !description) {
      return NextResponse.json({ error: "Name and description are required" }, { status: 400 })
    }

    const result = await executeQuery(
      'INSERT INTO programs (id, name, description, "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *',
      [`prog_${Date.now()}`, name, description],
    )

    console.log("[v0] Program created successfully:", result[0])
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Programs POST error:", error)
    const { message, status } = handleDatabaseError(error, "Failed to create program")
    return NextResponse.json({ error: message }, { status })
  }
}
