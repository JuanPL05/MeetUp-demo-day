import { type NextRequest, NextResponse } from "next/server"
import { executeQuery, handleDatabaseError } from "@/lib/database"

export async function GET() {
  try {
    console.log('[v0] Executing query: SELECT * FROM blocks ORDER BY "order" ASC...')
    const blocks = await executeQuery('SELECT * FROM blocks ORDER BY "order" ASC')
    console.log("[v0] Blocks fetched successfully:", blocks.length)
    return NextResponse.json(blocks)
  } catch (error: any) {
    console.error("[v0] Query execution failed:", {
      query: 'SELECT * FROM blocks ORDER BY "order" ASC',
      error: error.message,
    })
    return handleDatabaseError(error, "Failed to fetch blocks")
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, order } = body

    const id = `block_${Date.now()}`
    const query =
      'INSERT INTO blocks (id, name, description, "order", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *'
    const params = [id, name, description || null, order]

    console.log("[v0] Executing query:", query, "with params:", params)
    const result = await executeQuery(query, params)
    const block = result[0]

    console.log("[v0] Block created successfully:", block)
    return NextResponse.json(block, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Query execution failed:", { error: error.message })
    return handleDatabaseError(error, "Failed to create block")
  }
}
