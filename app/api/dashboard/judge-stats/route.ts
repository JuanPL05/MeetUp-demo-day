import { NextResponse } from "next/server"
import { executeQuery, handleDatabaseError } from "@/lib/database"

export async function GET() {
  try {
    console.log("[v0] Judge Stats API: Starting judge stats calculation")

    // Obtener el total de proyectos
    const projectCountQuery = "SELECT COUNT(*) as count FROM projects"
    const projectCountResult = await executeQuery(projectCountQuery)
    const totalProjects = Number.parseInt(projectCountResult[0].count)
    
    // Obtener el total de preguntas por programa
    const questionsPerProgramQuery = `
      SELECT 
        p.name as program_name,
        COUNT(q.id) as question_count
      FROM programs p
      LEFT JOIN questions q ON p.id = q."programId"
      GROUP BY p.id, p.name
    `
    const questionsPerProgramResult = await executeQuery(questionsPerProgramQuery)
    
    // Calcular cuántos jueces han completado todas las evaluaciones
    // Un juez ha completado todo si tiene evaluaciones para todos los proyectos y todas las preguntas
    const judgeCompletionQuery = `
      SELECT 
        j.id as judge_id,
        j.name as judge_name,
        COUNT(DISTINCT e."projectId") as projects_evaluated,
        COUNT(e.id) as total_evaluations
      FROM judges j
      LEFT JOIN evaluations e ON j.id = e."judgeId"
      GROUP BY j.id, j.name
    `
    
    const judgeCompletionResult = await executeQuery(judgeCompletionQuery)
    
    // Para cada juez, verificar si ha completado todas las evaluaciones posibles
    // Necesitamos calcular el total de preguntas * total de proyectos para saber el máximo posible
    const totalQuestionsQuery = "SELECT COUNT(*) as count FROM questions"
    const totalQuestionsResult = await executeQuery(totalQuestionsQuery)
    const totalQuestions = Number.parseInt(totalQuestionsResult[0].count)
    
    const maxPossibleEvaluations = totalProjects * totalQuestions
    
    // Contar jueces que han completado todas las evaluaciones
    const completedJudges = judgeCompletionResult.filter(judge => {
      const hasAllProjects = judge.projects_evaluated === totalProjects
      const hasAllEvaluations = judge.total_evaluations === maxPossibleEvaluations
      return hasAllProjects && hasAllEvaluations
    }).length

    const stats = {
      totalJudges: judgeCompletionResult.length,
      completedJudges: completedJudges,
      totalProjects: totalProjects,
      totalQuestions: totalQuestions,
      maxPossibleEvaluations: maxPossibleEvaluations
    }

    console.log("[v0] Judge Stats API: Stats calculated:", stats)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("[v0] Judge Stats error:", error)
    return handleDatabaseError(error, "Failed to fetch judge statistics")
  }
}
