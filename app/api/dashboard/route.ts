import { NextResponse } from "next/server"
import { executeQuery, handleDatabaseError } from "@/lib/database"

export async function GET() {
  try {
    console.log("[v0] Dashboard API: Starting data fetch")

    const evaluationCountCheck = await executeQuery("SELECT COUNT(*) as count FROM evaluations")
    const totalEvaluations = Number.parseInt(evaluationCountCheck[0].count)
    console.log("[v0] Dashboard API: Total evaluations in database:", totalEvaluations)

    let hasQuestionScore = false
    try {
      const scoreCheck = await executeQuery(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'questions' AND column_name = 'score'
      `)
      hasQuestionScore = scoreCheck.length > 0
      console.log("[v0] Dashboard API: Questions have score column:", hasQuestionScore)
    } catch (columnCheckError) {
      console.log("[v0] Dashboard API: Column check failed, using fallback")
    }

    // Fetch projects with their programs, teams, and evaluations
    const projectsQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p."programId",
        p."teamId",
        prog.name as "programName",
        t.name as "teamName",
        t.description as "teamDescription"
      FROM projects p
      LEFT JOIN programs prog ON p."programId" = prog.id
      LEFT JOIN teams t ON p."teamId" = t.id
      ORDER BY p."createdAt" DESC
    `

    const projectsResult = await executeQuery(projectsQuery)
    
    // Get total number of judges for calculating completion metrics
    const judgesCountQuery = `SELECT COUNT(*) as count FROM judges`
    const judgesResult = await executeQuery(judgesCountQuery)
    const totalJudges = Number.parseInt(judgesResult[0].count)
    console.log("[v0] Dashboard API: Found", projectsResult.length, "projects")

    let evaluationsQuery = ""
    if (hasQuestionScore) {
      evaluationsQuery = `
        SELECT 
          e.score,
          e."projectId",
          e."questionId",
          e."judgeId",
          q.text as "questionText",
          q.score as "questionMaxScore",
          q."blockId",
          b.name as "blockName",
          b.id as "blockIdCheck"
        FROM evaluations e
        INNER JOIN questions q ON e."questionId" = q.id
        INNER JOIN blocks b ON q."blockId" = b.id
        WHERE e.score IS NOT NULL AND q.id IS NOT NULL AND b.id IS NOT NULL
      `
    } else {
      evaluationsQuery = `
        SELECT 
          e.score,
          e."projectId",
          e."questionId",
          e."judgeId",
          q.text as "questionText",
          q."blockId",
          b.name as "blockName",
          b.id as "blockIdCheck"
        FROM evaluations e
        INNER JOIN questions q ON e."questionId" = q.id
        INNER JOIN blocks b ON q."blockId" = b.id
        WHERE e.score IS NOT NULL AND q.id IS NOT NULL AND b.id IS NOT NULL
      `
    }

    const evaluationsResult = await executeQuery(evaluationsQuery)
    console.log("[v0] Dashboard API: Found", evaluationsResult.length, "evaluations with valid joins")

    if (evaluationsResult.length > 0) {
      console.log("[v0] Sample evaluation data:")
      evaluationsResult.slice(0, 3).forEach((evaluation, index) => {
        console.log(
          `[v0] Eval ${index}: projectId=${evaluation.projectId}, score=${evaluation.score}, blockName="${evaluation.blockName}", blockId=${evaluation.blockIdCheck}`,
        )
      })
    }

    let totalQuestionsResult
    let maxPossibleScoreQuery = ""

    if (hasQuestionScore) {
      // Use actual question scores for max possible score calculation
      maxPossibleScoreQuery = `
        SELECT 
          prog.name as "programName",
          SUM(q.score) as "maxScore",
          COUNT(q.id) as "questionCount"
        FROM questions q
        LEFT JOIN programs prog ON q."programId" = prog.id
        GROUP BY prog.id, prog.name
      `
    } else {
      totalQuestionsResult = await executeQuery("SELECT COUNT(*) as count FROM questions")
    }

    let maxScoresByProgram = {}
    if (hasQuestionScore) {
      const maxScoresResult = await executeQuery(maxPossibleScoreQuery)
      maxScoresByProgram = maxScoresResult.reduce((acc, row) => {
        acc[row.programName] = {
          maxScore: Number.parseFloat(row.maxScore) || 10, // Default fallback
          questionCount: Number.parseInt(row.questionCount) || 0,
        }
        return acc
      }, {})
    } else {
      const totalQuestions = Number.parseInt(totalQuestionsResult[0].count)
      console.log("[v0] Dashboard API: Found", totalQuestions, "total questions")
    }

    // Group evaluations by project
    const evaluationsByProject = evaluationsResult.reduce(
      (acc, evaluation) => {
        const projectId = evaluation.projectId
        if (!acc[projectId]) {
          acc[projectId] = []
        }
        acc[projectId].push(evaluation)
        return acc
      },
      {} as Record<string, any[]>,
    )

    const projectScores = projectsResult.map((project) => {
      const evaluations = evaluationsByProject[project.id] || []

      console.log(`[v0] Dashboard API: Project ${project.name} has ${evaluations.length} evaluations`)

      if (evaluations.length > 0) {
        console.log(`[v0] Project ${project.name} evaluation details:`)
        evaluations.slice(0, 5).forEach((evaluation, index) => {
          console.log(
            `[v0] - Eval ${index}: blockName="${evaluation.blockName}", score=${evaluation.score}, questionMaxScore=${evaluation.questionMaxScore}`,
          )
        })
      }

      let totalScore = 0
      let maxPossibleScore = 0

      // Calculate average score in star rating (1-5)
      const averageScore =
        evaluations.length > 0
          ? evaluations.reduce((sum, evaluation) => sum + Number.parseFloat(evaluation.score), 0) / evaluations.length
          : 0

      if (hasQuestionScore) {
        // New scoring system: convert average star rating to base 10 scale
        const programMaxScore = maxScoresByProgram[project.programName]
        maxPossibleScore = programMaxScore ? programMaxScore.maxScore : 10 // Default fallback
        
        // Convert average star rating (1-5) to total score (base 10)
        // If average is 3.2/5, totalScore should be 6.4/10
        totalScore = (averageScore / 5) * maxPossibleScore
      } else {
        // Old scoring system: direct star ratings
        const totalQuestions = Number.parseInt(totalQuestionsResult[0].count)
        maxPossibleScore = totalQuestions * 5
        totalScore = averageScore * evaluations.length / totalQuestions // Normalize to average per question
      }

      // Calculate completion percentage based on program-specific question count
      let programQuestionCount = 14 // Default assumption: 14 questions per program
      
      if (hasQuestionScore && maxScoresByProgram[project.programName]) {
        programQuestionCount = maxScoresByProgram[project.programName].questionCount
      }
      
      // Calculate how many judges have fully evaluated this project
      const judgeEvaluationCounts = evaluations.reduce((acc: Record<string, number>, evaluation: any) => {
        const judgeId = evaluation.judgeId || 'unknown'
        acc[judgeId] = (acc[judgeId] || 0) + 1
        return acc
      }, {})
      
      const fullyEvaluatedJudges = Object.values(judgeEvaluationCounts).filter(
        (count: any) => count >= programQuestionCount
      ).length
      
      const completionPercentage = totalJudges > 0 
        ? (fullyEvaluatedJudges / totalJudges) * 100 
        : 0

      console.log(`[v0] Project ${project.name} completion: ${fullyEvaluatedJudges}/${totalJudges} judges completed = ${completionPercentage.toFixed(1)}%`)
      
      const scoresByBlock = evaluations.reduce(
        (acc, evaluation) => {
          const blockName = evaluation.blockName

          // Skip evaluations without valid block names
          if (!blockName || blockName === "null" || blockName === "undefined") {
            console.log(`[v0] Skipping evaluation with invalid blockName: "${blockName}"`)
            return acc
          }

          if (!acc[blockName]) {
            acc[blockName] = { total: 0, count: 0 }
          }

          // Use star rating directly for block averages (1-5 scale)
          const score = Number.parseFloat(evaluation.score) || 0
          acc[blockName].total += score
          acc[blockName].count += 1
          return acc
        },
        {} as Record<string, { total: number; count: number }>,
      )

      console.log(`[v0] Project ${project.name} block calculations:`)
      Object.entries(scoresByBlock).forEach(([blockName, data]) => {
        const average = data.count > 0 ? data.total / data.count : 0
        console.log(
          `[v0] - Block "${blockName}": total=${data.total}, count=${data.count}, average=${average.toFixed(2)}`,
        )
      })

      const blockAverages = Object.entries(scoresByBlock).map(([blockName, data]) => ({
        blockName,
        average: data.count > 0 ? data.total / data.count : 0,
      }))

      console.log(`[v0] Project ${project.name} final scores:`)
      console.log(`[v0] - averageScore: ${averageScore}`)
      console.log(`[v0] - totalScore: ${totalScore}`)
      console.log(`[v0] - blockAverages count: ${blockAverages.length}`)

      return {
        id: project.id,
        name: project.name,
        team: project.teamName,
        teamDescription: project.teamDescription,
        program: project.programName,
        totalScore,
        averageScore,
        maxPossibleScore,
        completionPercentage,
        evaluationCount: fullyEvaluatedJudges, // Number of judges who completed all questions
        totalEvaluations: evaluations.length, // Total individual question evaluations
        totalJudges, // Total number of judges for reference
        blockAverages,
      }
    })

    projectScores.sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))

    // Add ranking
    const rankedProjects = projectScores.map((project, index) => ({
      ...project,
      rank: index + 1,
    }))

    console.log("[v0] Dashboard API: Final response summary:")
    rankedProjects.slice(0, 3).forEach((project, index) => {
      console.log(
        `[v0] Rank ${project.rank}: ${project.name} - avg: ${project.averageScore}, total: ${project.totalScore}, blocks: ${project.blockAverages.length}`,
      )
    })

    console.log("[v0] Dashboard API: Returning", rankedProjects.length, "ranked projects")
    return NextResponse.json(rankedProjects)
  } catch (error) {
    console.error("[v0] Dashboard error:", error)
    return handleDatabaseError(error, "Failed to fetch dashboard data")
  }
}
