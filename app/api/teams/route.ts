import { type NextRequest, NextResponse } from "next/server"
import { executeQuery, handleDatabaseError } from "@/lib/database"

export async function GET() {
  try {
    console.log("[v0] Fetching teams...")

    const query = `SELECT * FROM teams ORDER BY "createdAt" DESC`
    const teams = await executeQuery(query)

    console.log("[v0] Teams fetched successfully:", teams.length)
    return NextResponse.json(teams)
  } catch (error) {
    console.error("[v0] Error fetching teams:", error)
    return handleDatabaseError(error, "Failed to fetch teams")
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body

    console.log("[v0] Creating team:", { name, description })

    const query = `
      INSERT INTO teams (name, description, "createdAt", "updatedAt")
      VALUES ($1, $2, NOW(), NOW())
      RETURNING *
    `

    const result = await executeQuery(query, [name, description])
    const team = result[0]

    console.log("[v0] Team created successfully:", team.id)
    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating team:", error)
    return handleDatabaseError(error, "Failed to create team")
  }
}
