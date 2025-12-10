import { type NextRequest, NextResponse } from "next/server"
import { executeQuery, handleDatabaseError } from "@/lib/database"

export async function GET() {
  try {
    console.log("[v0] Fetching judges...")

    const query = `SELECT * FROM judges ORDER BY "createdAt" DESC`
    const judges = await executeQuery(query)

    console.log("[v0] Judges fetched successfully:", judges.length)
    return NextResponse.json(judges)
  } catch (error) {
    console.error("[v0] Error fetching judges:", error)
    return handleDatabaseError(error, "Failed to fetch judges")
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email } = body

    console.log("[v0] Creating judge:", { name, email })

    const generateTokenFromName = (fullName: string): string => {
      return fullName
        .replace(/[áàäâ]/g, "a")
        .replace(/[éèëê]/g, "e")
        .replace(/[íìïî]/g, "i")
        .replace(/[óòöô]/g, "o")
        .replace(/[úùüû]/g, "u")
        .replace(/[ñ]/g, "n")
        .replace(/[ç]/g, "c")
        .replace(/[ÁÀÄÂ]/g, "A")
        .replace(/[ÉÈËÊ]/g, "E")
        .replace(/[ÍÌÏÎ]/g, "I")
        .replace(/[ÓÒÖÔ]/g, "O")
        .replace(/[ÚÙÜÛ]/g, "U")
        .replace(/[Ñ]/g, "N")
        .replace(/[Ç]/g, "C")
        .replace(/[^a-zA-Z0-9]/g, "") // Remove all non-alphanumeric characters
    }

    const token = generateTokenFromName(name)

    const query = `
      INSERT INTO judges (name, email, token, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *
    `

    const result = await executeQuery(query, [name, email, token])
    const judge = result[0]

    console.log("[v0] Judge created successfully:", judge.id)
    return NextResponse.json(judge, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating judge:", error)
    return handleDatabaseError(error, "Failed to create judge")
  }
}
