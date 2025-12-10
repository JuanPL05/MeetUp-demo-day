import { NextResponse } from "next/server"
import { executeQuery, handleDatabaseError } from "@/lib/database"

export async function GET() {
  try {
    console.log("[v0] Fetching all judge tokens...")

    const query = `SELECT id, name, email, token FROM judges ORDER BY name`
    const judges = await executeQuery(query)

    console.log("[v0] Judge tokens fetched successfully:", judges.length)

    // Return tokens in a format that's easy to use for testing
    const tokenInfo = judges.map((judge) => ({
      name: judge.name,
      email: judge.email,
      token: judge.token,
      evaluationLink: `/judge/${judge.token}`,
    }))

    return NextResponse.json({
      count: judges.length,
      judges: tokenInfo,
    })
  } catch (error) {
    console.error("[v0] Error fetching judge tokens:", error)
    return handleDatabaseError(error, "Failed to fetch judge tokens")
  }
}
