import { NextResponse } from "next/server"
import { executeQuery, handleDatabaseError } from "@/lib/database"

export async function GET() {
  try {
    console.log("[DEBUG] Getting project count debugging info...")

    // Count all projectss
    const allProjectsQuery = `
      SELECT 
        p.id,
        p.name,
        p."programId",
        pr.name as program_name
      FROM projects p
      LEFT JOIN programs pr ON p."programId" = pr.id
      ORDER BY pr.name, p.name
    `
    const allProjects = await executeQuery(allProjectsQuery)

    // Count by program
    const projectsByProgramQuery = `
      SELECT 
        pr.name as program_name,
        COUNT(p.id) as project_count
      FROM programs pr
      LEFT JOIN projects p ON pr.id = p."programId"
      GROUP BY pr.id, pr.name
      ORDER BY pr.name
    `
    const projectsByProgram = await executeQuery(projectsByProgramQuery)

    // Get evaluation stats
    const evaluationStatsQuery = `
      SELECT 
        p.id as project_id,
        p.name as project_name,
        COUNT(DISTINCT e."judgeId") as judge_count,
        COUNT(e.id) as evaluation_count
      FROM projects p
      LEFT JOIN evaluations e ON p.id = e."projectId"
      GROUP BY p.id, p.name
      ORDER BY p.name
    `
    const evaluationStats = await executeQuery(evaluationStatsQuery)

    const response = {
      totalProjects: allProjects.length,
      allProjects: allProjects.map(p => ({
        id: p.id,
        name: p.name,
        programName: p.program_name
      })),
      projectsByProgram,
      evaluationStats,
      summary: {
        totalCount: allProjects.length,
        incubacionCount: allProjects.filter(p => p.program_name?.toLowerCase().includes('incubación')).length,
        aceleracionCount: allProjects.filter(p => p.program_name?.toLowerCase().includes('aceleración')).length
      }
    }

    console.log("[DEBUG] Project count summary:", response.summary)

    return NextResponse.json(response)
  } catch (error) {
    console.error("[DEBUG] Error getting project count info:", error)
    return handleDatabaseError(error, "Failed to get project count debug info")
  }
}
