import { executeQuery } from "../lib/database"

async function main() {
  console.log("[v0] Checking database connection...")

  try {
    await executeQuery("SELECT 1")
    console.log("[v0] Database connection successful")
  } catch (error) {
    console.error("[v0] Database connection failed:", error)
    process.exit(1)
  }

  console.log("[v0] Checking database tables...")

  try {
    const tableChecks = await Promise.all([
      executeQuery("SELECT COUNT(*) as count FROM programs"),
      executeQuery("SELECT COUNT(*) as count FROM blocks"),
      executeQuery("SELECT COUNT(*) as count FROM questions"),
      executeQuery("SELECT COUNT(*) as count FROM teams"),
      executeQuery("SELECT COUNT(*) as count FROM projects"),
      executeQuery("SELECT COUNT(*) as count FROM judges"),
      executeQuery("SELECT COUNT(*) as count FROM evaluations"),
    ])

    console.log("[v0] Table counts:")
    console.log(`  - Programs: ${tableChecks[0][0].count}`)
    console.log(`  - Blocks: ${tableChecks[1][0].count}`)
    console.log(`  - Questions: ${tableChecks[2][0].count}`)
    console.log(`  - Teams: ${tableChecks[3][0].count}`)
    console.log(`  - Projects: ${tableChecks[4][0].count}`)
    console.log(`  - Judges: ${tableChecks[5][0].count}`)
    console.log(`  - Evaluations: ${tableChecks[6][0].count}`)

    console.log("[v0] Database is working correctly!")
  } catch (error) {
    console.error("[v0] Error checking database tables:", error)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error("[v0] Script failed:", error)
  process.exit(1)
})
