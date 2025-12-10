import { NextResponse } from "next/server"
import { executeQuery, handleDatabaseError } from "@/lib/database"

export async function POST() {
  try {
    // Simply add a prefix to all tokens to invalidate them
    const updateQuery = `
      UPDATE judges 
      SET token = 'DISABLED_' || token 
      WHERE token NOT LIKE 'DISABLED_%'
    `
    
    const result = await executeQuery(updateQuery)
    
    // Count how many judges were affected
    const countQuery = `SELECT COUNT(*) as count FROM judges WHERE token LIKE 'DISABLED_%'`
    const countResult = await executeQuery(countQuery)
    const disabledCount = countResult[0].count

    console.log(`[v0] DISABLED ${disabledCount} judge tokens`)
    
    return NextResponse.json({
      success: true,
      message: `Votación cerrada. ${disabledCount} enlaces de jueces deshabilitados.`,
      disabledCount: parseInt(disabledCount)
    })
  } catch (error) {
    console.error("[v0] Error disabling judge tokens:", error)
    return handleDatabaseError(error, "Failed to disable judge tokens")
  }
}
