"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EvaluationForm } from "@/components/judge/evaluation-form"
import { RankingTable } from "@/components/dashboard/ranking-table"
import { ScoreChart } from "@/components/dashboard/score-chart"
import { ProjectDetails } from "@/components/dashboard/project-details"
import { AlertCircle, CheckCircle, Clock, Trophy, BarChart3, Users, ClipboardList, FileText, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Judge {
  id: string
  name: string
  email: string
  token: string
}

interface Project {
  id: string
  name: string
  description: string | null
  program: string
  team: string
  teamDescription?: string
  evaluationsCount: number
  averageScore: number
}

interface Block {
  id: string
  name: string
  description: string | null
  order: number
}

interface Question {
  id: string
  text: string
  description?: string // Added optional description field
  score?: number // Added score field for question weighting
  order: number
  blockId: string
  block: {
    id: string
    name: string
  }
  programId?: string
}

interface Evaluation {
  id: string
  score: number
  judgeId: string
  projectId: string
  questionId: string
}

export default function JudgeEvaluationPage() {
  const params = useParams()
  const token = params.token as string

  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedDashboardProject, setSelectedDashboardProject] = useState<string | null>(null)
  const [judge, setJudge] = useState<Judge | null>(null)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("evaluation")
  const [activeBlock, setActiveBlock] = useState<string | null>(null)
  const [dashboardView, setDashboardView] = useState<"ranking" | "analysis">("ranking")

  console.log("[v0] EVALUATION PANEL: Starting with token:", token)

  useEffect(() => {
    const validateToken = async () => {
      try {
        console.log("[v0] EVALUATION PANEL: Validating token...")
        const response = await fetch(`/api/judges/validate/${token}`)

        if (response.ok) {
          const judgeData = await response.json()
          console.log("[v0] EVALUATION PANEL: Token valid for judge:", judgeData.name)
          setJudge(judgeData)
          setTokenError(null)
        } else {
          const errorData = await response.json()
          console.log("[v0] EVALUATION PANEL: Token validation failed:", errorData)

          if (errorData.isDisabled) {
            setTokenError("La evaluación ha sido cerrada por el administrador")
          } else {
            setTokenError(errorData.message || "Token inválido o expirado")
          }
        }
      } catch (error) {
        console.error("[v0] EVALUATION PANEL: Token validation error:", error)
        setTokenError("Error validando token")
      }
    }

    if (token) {
      validateToken()
    }
  }, [token])

  const {
    data: dashboardData,
    error: dashboardError,
    mutate: mutateDashboard,
  } = useSWR("/api/dashboard", fetcher, {
    refreshInterval: 15000,
    onSuccess: (data) => console.log("[v0] EVALUATION PANEL: Dashboard loaded:", data?.length || 0),
    onError: (error) => console.error("[v0] EVALUATION PANEL: Dashboard error:", error),
  })

  const { data: questionsData, error: questionsError } = useSWR("/api/questions", fetcher, {
    onSuccess: (data) => console.log("[v0] EVALUATION PANEL: Questions loaded:", data?.length || 0),
    onError: (error) => console.error("[v0] EVALUATION PANEL: Questions error:", error),
  })

  const { data: blocksData, error: blocksError } = useSWR("/api/blocks", fetcher, {
    onSuccess: (data) => console.log("[v0] EVALUATION PANEL: Blocks loaded:", data?.length || 0),
    onError: (error) => console.error("[v0] EVALUATION PANEL: Blocks error:", error),
  })

  const {
    data: evaluations,
    mutate: mutateEvaluations,
    error: evaluationsError,
  } = useSWR<Evaluation[]>(judge ? `/api/evaluations?judgeId=${judge.id}` : null, fetcher, {
    refreshInterval: 10000,
    onSuccess: (data) => {
      console.log("[v0] EVALUATION PANEL: Evaluations loaded:", data?.length || 0)
      // Refresh dashboard data when evaluations change
      mutateDashboard()
    },
    onError: (error) => console.error("[v0] EVALUATION PANEL: Evaluations error:", error),
  })

  const projects = dashboardData || []
  const blocks = blocksData || []
  const questions = questionsData || []

  useEffect(() => {
    if (selectedProject && blocks.length > 0 && questions.length > 0) {
      const filteredBlocks = getFilteredBlocks(selectedProject)
      console.log("[v0] Auto-selecting block for project:", selectedProject, "Found blocks:", filteredBlocks.length)

      if (filteredBlocks.length > 0) {
        setActiveBlock(filteredBlocks[0].id)
        console.log("[v0] Auto-selected first block:", filteredBlocks[0].name)
      } else {
        console.warn("[v0] No blocks found for project:", selectedProject)
        setActiveBlock(null)
      }
    }
  }, [selectedProject, blocks, questions])

  const getQuestionsForProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) return questions

    // Filter questions by program type
    const filteredQuestions = questions.filter((q) => {
      // If question has programId, match it with project's program
      if (q.programId) {
        const projectProgram = project.program?.toLowerCase()
        const questionProgram = q.programId?.toLowerCase()

        if (projectProgram?.includes("incubación") || projectProgram?.includes("incubacion")) {
          return questionProgram?.includes("incubation") || questionProgram?.includes("incubación")
        }
        if (projectProgram?.includes("aceleración") || projectProgram?.includes("aceleracion")) {
          return questionProgram?.includes("acceleration") || questionProgram?.includes("aceleración")
        }
      }

      // If no programId, include all questions (backward compatibility)
      return true
    })

    // Debug: Log filtered questions
    console.log("[DEBUG] Filtering questions for project:", {
      projectName: project.name,
      projectProgram: project.program,
      totalQuestions: questions.length,
      filteredQuestionsCount: filteredQuestions.length,
      sampleFilteredQuestions: filteredQuestions.slice(0, 3).map((q) => ({
        id: q.id,
        text: q.text?.substring(0, 50) + "...",
        programId: q.programId,
      })),
    })

    return filteredQuestions
  }

  const getBlocksForProject = (projectId: string) => {
    const projectQuestions = getQuestionsForProject(projectId)
    const blockIds = new Set(projectQuestions.map((q) => q.blockId))

    // Only return blocks that have questions for this project's program
    return blocks.filter((block) => blockIds.has(block.id))
  }

  const getQuestionsByBlock = (projectId: string) => {
    const projectQuestions = getQuestionsForProject(projectId)
    return projectQuestions.reduce(
      (acc, question) => {
        const blockId = question.blockId
        if (!acc[blockId]) {
          acc[blockId] = []
        }
        acc[blockId].push(question)
        return acc
      },
      {} as Record<string, Question[]>,
    )
  }

  const getFilteredBlocks = (projectId: string | null) => {
    if (!projectId) return blocks.sort((a, b) => (a.order || 0) - (b.order || 0))

    const filteredBlocks = getBlocksForProject(projectId).sort((a, b) => (a.order || 0) - (b.order || 0))
    const selectedProject = projects.find((p) => p.id === projectId)

    // Debug: Log filtered blocks
    console.log("[DEBUG] Filtering blocks for project:", {
      projectId,
      projectName: selectedProject?.name,
      projectProgram: selectedProject?.program,
      totalBlocks: blocks.length,
      filteredBlocksCount: filteredBlocks.length,
      filteredBlockNames: filteredBlocks.map((b) => b.name),
    })

    return filteredBlocks
  }

  const getProgressCalculation = () => {
    // Always calculate progress based on teams/projects evaluated
    const totalProjects = projects.length
    const evaluatedProjectIds = new Set(evaluations?.map((e) => e.projectId) || [])
    const evaluatedProjects = evaluatedProjectIds.size
    return {
      totalQuestions: questions.length,
      totalEvaluations: totalProjects,
      completedEvaluations: evaluatedProjects,
      progressPercentage: totalProjects > 0 ? (evaluatedProjects / totalProjects) * 100 : 0,
    }
  }

  const { totalQuestions, totalEvaluations, completedEvaluations, progressPercentage } = getProgressCalculation()

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId)
  }

  if (tokenError) {
    console.log("[v0] EVALUATION PANEL: Showing token error")
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <CardTitle>Token Inválido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              El enlace de evaluación no es válido o ha expirado. Por favor, contacta al administrador.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!dashboardData || !judge || !questionsData || !blocksData) {
    console.log("[v0] EVALUATION PANEL: Loading data...")
    console.log(
      "[v0] EVALUATION PANEL: Dashboard status:",
      dashboardData ? `✓ (${dashboardData.length})` : "❌ Loading...",
    )
    console.log("[v0] EVALUATION PANEL: Judge status:", judge ? `✓ (${judge.name})` : "❌ Validating...")
    console.log(
      "[v0] EVALUATION PANEL: Questions status:",
      questionsData ? `✓ (${questionsData.length})` : "❌ Loading...",
    )
    console.log("[v0] EVALUATION PANEL: Blocks status:", blocksData ? `✓ (${blocksData.length})` : "❌ Loading...")

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Clock className="w-8 h-8 mx-auto mb-4 animate-spin" />
          <p>Cargando datos de evaluación...</p>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Proyectos: {dashboardData ? `✓ (${dashboardData.length})` : "⏳ Cargando..."}</div>
            <div>Juez: {judge ? `✓ (${judge.name})` : "⏳ Validando..."}</div>
            <div>Preguntas: {questionsData ? `✓ (${questionsData.length})` : "⏳ Cargando..."}</div>
            <div>Bloques: {blocksData ? `✓ (${blocksData.length})` : "⏳ Cargando..."}</div>
            {dashboardError && <div className="text-red-500">❌ Error en dashboard: {dashboardError.message}</div>}
            {questionsError && <div className="text-red-500">❌ Error en preguntas: {questionsError.message}</div>}
            {blocksError && <div className="text-red-500">❌ Error en bloques: {blocksError.message}</div>}
            {questionsData && questionsData.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
                <h3 className="text-2xl font-bold mb-3">Base de datos vacía</h3>
                <p className="text-muted-foreground">
                  El administrador debe ejecutar la operación de poblado de datos desde el panel de administración.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  console.log("[v0] EVALUATION PANEL: Rendering main interface with", projects.length, "projects")
  console.log("[v0] EVALUATION PANEL: Total questions available:", questions.length)
  console.log("[v0] EVALUATION PANEL: Total blocks available:", blocks.length)

  const safeEvaluations = evaluations || []

  // Removed programConfig and organizedPrograms, sortedPrograms as they are no longer needed for the simplified structure.

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="mb-4 sm:mb-6 md:mb-8 bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-lg border border-slate-200">
          <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-center md:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 text-slate-900">
                Panel de Evaluación
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-slate-600">
                Bienvenido, <span className="text-primary font-semibold">{judge?.name || "Juez"}</span>
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg md:rounded-xl p-3 md:p-4 border border-slate-200 w-full md:w-auto">
              <div className="flex items-center gap-2 md:gap-3 mb-2 justify-center md:justify-start">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-accent flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-slate-700">
                  {completedEvaluations} de {totalEvaluations} equipos evaluados
                </span>
              </div>
              <Progress value={progressPercentage} className="w-full md:w-72 h-2 md:h-3" />
              <div className="text-xs text-slate-600 mt-2 text-center font-medium">
                {Math.round(progressPercentage)}% completado
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4 sm:mb-6 md:mb-8">
          <TabsList className="grid w-full grid-cols-2 bg-white border-2 border-blue-300 shadow-lg h-10 sm:h-12 md:h-14 rounded-lg sm:rounded-xl px-1 py-1">
            <TabsTrigger
              value="evaluation"
              className="flex items-center justify-center gap-1 sm:gap-2 font-bold text-xs sm:text-sm md:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-green-500 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-slate-700 rounded-md sm:rounded-lg transition-all"
            >
              <ClipboardList className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="hidden xs:inline sm:hidden md:inline">Evaluación</span>
              <span className="xs:hidden sm:inline md:hidden">Eval.</span>
            </TabsTrigger>
            <TabsTrigger
              value="dashboard"
              className="flex items-center justify-center gap-1 sm:gap-2 font-bold text-xs sm:text-sm md:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-green-500 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-slate-700 rounded-md sm:rounded-lg transition-all"
            >
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="hidden xs:inline sm:hidden md:inline">Dashboard</span>
              <span className="xs:hidden sm:inline md:hidden">Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="evaluation" className="mt-4 sm:mt-6">
            <div className="space-y-4 sm:space-y-6">
              <Card className="overflow-hidden border-slate-200 shadow-lg bg-white">
                <CardHeader className="pb-4 sm:pb-6 bg-slate-50 border-b border-slate-200 p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-primary/10 flex-shrink-0">
                          <Users className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-1">
                            Equipos Participantes
                          </h3>
                          <p className="text-xs sm:text-sm md:text-base text-slate-600">
                            {projects.length} proyecto{projects.length !== 1 ? "s" : ""} disponible
                            {projects.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-primary text-white text-sm sm:text-base md:text-lg font-semibold px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 shadow-md self-center sm:self-auto">
                        {projects.length}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mt-4 sm:mt-6">
                      {projects.map((project) => {
                        const projectEvaluations = safeEvaluations.filter((e) => e.projectId === project.id)
                        const projectQuestions = getQuestionsForProject(project.id)
                        const projectQuestionCount = projectQuestions.length
                        const projectProgress =
                          projectQuestionCount > 0 ? (projectEvaluations.length / projectQuestionCount) * 100 : 0
                        const isComplete = projectProgress === 100

                        return (
                          <Card
                            key={project.id}
                            onClick={() => handleProjectSelect(project.id)}
                            className={`cursor-pointer transition-all duration-300 border-2 ${
                              selectedProject === project.id
                                ? "border-primary bg-primary/5 shadow-lg"
                                : "border-slate-200 hover:border-primary/50 hover:shadow-md"
                            }`}
                          >
                            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
                              <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-sm sm:text-base md:text-lg font-bold text-slate-900 break-words flex-1">
                                  {project.name}
                                </CardTitle>
                                {isComplete && (
                                  <Badge className="bg-accent text-white flex-shrink-0 text-xs px-2 py-0.5">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    <span className="hidden sm:inline">Completo</span>
                                    <span className="sm:hidden">✓</span>
                                  </Badge>
                                )}
                              </div>
                              {project.description && (
                                <p className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2 line-clamp-2">
                                  {project.description}
                                </p>
                              )}
                            </CardHeader>
                            <CardContent className="pb-3 sm:pb-4 p-3 sm:p-4 pt-0">
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs sm:text-sm font-medium">
                                  <span className="text-slate-600">Progreso</span>
                                  <span className="text-primary">{Math.round(projectProgress)}%</span>
                                </div>
                                <Progress value={projectProgress} className="h-1.5 sm:h-2" />
                                <p className="text-xs text-slate-500">
                                  {projectEvaluations.length} de {projectQuestionCount} preguntas
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-3 sm:p-4 md:p-6">
                  {!selectedProject ? (
                    <div className="text-center py-8 sm:py-12 md:py-16">
                      <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 text-slate-400" />
                      <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium">
                        Selecciona un proyecto para comenzar la evaluación
                      </p>
                    </div>
                  ) : (
                    (() => {
                      const filteredBlocks = getFilteredBlocks(selectedProject)
                      const questionsByBlock = getQuestionsByBlock(selectedProject)

                      if (filteredBlocks.length === 0) {
                        return (
                          <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
                            <AlertCircle className="w-16 h-16 mx-auto mb-6 text-slate-400" />
                            <h3 className="text-xl font-bold mb-3 text-slate-900">No hay bloques disponibles</h3>
                            <p className="text-slate-600">
                              No se encontraron bloques con preguntas para este programa.
                            </p>
                          </div>
                        )
                      }

                      return (
                        <Tabs value={activeBlock || filteredBlocks[0].id} onValueChange={setActiveBlock}>
                          <div className="w-full overflow-x-auto -mx-3 px-3 sm:-mx-4 sm:px-4 md:mx-0 md:px-0 mb-4 sm:mb-6">
                            <TabsList className="inline-flex h-9 sm:h-10 md:h-12 items-center justify-start rounded-lg bg-slate-100 p-1 border border-slate-200 min-w-full md:min-w-0">
                              {filteredBlocks.map((block) => {
                                const blockQuestions = questionsByBlock[block.id] || []
                                const blockEvaluations = safeEvaluations.filter(
                                  (e) =>
                                    e.projectId === selectedProject &&
                                    blockQuestions.some((q) => q.id === e.questionId),
                                )
                                const blockProgress =
                                  blockQuestions.length > 0
                                    ? (blockEvaluations.length / blockQuestions.length) * 100
                                    : 0

                                return (
                                  <TabsTrigger
                                    key={block.id}
                                    value={block.id}
                                    className="relative text-xs sm:text-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 h-7 sm:h-8 md:h-10 whitespace-nowrap flex-shrink-0 font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all"
                                  >
                                    <span className="truncate max-w-[80px] sm:max-w-[100px] md:max-w-[150px]">
                                      {block.name}
                                    </span>
                                    {blockProgress === 100 && (
                                      <div className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 bg-accent rounded-full p-0.5">
                                        <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                                      </div>
                                    )}
                                  </TabsTrigger>
                                )
                              })}
                            </TabsList>
                          </div>

                          {filteredBlocks.map((block) => (
                            <TabsContent key={block.id} value={block.id} className="mt-0">
                              <EvaluationForm
                                block={block}
                                questions={questionsByBlock[block.id] || []}
                                projectId={selectedProject}
                                judgeId={judge.id}
                                evaluations={safeEvaluations}
                                onEvaluationChange={mutateEvaluations}
                              />
                            </TabsContent>
                          ))}
                        </Tabs>
                      )
                    })()
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="mt-4 sm:mt-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Proyectos Totales */}
                <Card className="border-slate-200 shadow-md bg-white hover:shadow-lg transition-shadow">
                  <CardHeader className="p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-slate-600 mb-1 truncate">Proyectos Totales</p>
                        <p className="text-2xl sm:text-3xl font-bold text-slate-900">{dashboardData.length}</p>
                      </div>
                      <div className="bg-blue-100 p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0">
                        <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Proyectos en Evaluación */}
                <Card className="border-slate-200 shadow-md bg-white hover:shadow-lg transition-shadow">
                  <CardHeader className="p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-slate-600 mb-1 truncate">Proyectos en Evaluación</p>
                        <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                          {dashboardData.filter((p: any) => p.evaluationsCount > 0).length}
                        </p>
                      </div>
                      <div className="bg-green-100 p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Evaluaciones Completadas */}
                <Card className="border-slate-200 shadow-md bg-white hover:shadow-lg transition-shadow">
                  <CardHeader className="p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-slate-600 mb-1 truncate">Evaluaciones Completadas</p>
                        <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                          {dashboardData.filter((p: any) => p.evaluationsCount > 0).length}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">de {dashboardData.length} proyectos</p>
                      </div>
                      <div className="bg-purple-100 p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Puntuación Promedio */}
                <Card className="border-slate-200 shadow-md bg-white hover:shadow-lg transition-shadow">
                  <CardHeader className="p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-slate-600 mb-1 truncate">Puntuación Promedio</p>
                        <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                          {dashboardData.length > 0
                            ? (
                                dashboardData.reduce((acc: number, p: any) => acc + (p.averageScore || 0), 0) /
                                dashboardData.length
                              ).toFixed(1)
                            : "0.0"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Promedio general</p>
                      </div>
                      <div className="bg-amber-100 p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0">
                        <Star className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>

              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 justify-center">
                <Button
                  onClick={() => setDashboardView("ranking")}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                    dashboardView === "ranking"
                      ? "bg-primary text-white shadow-md"
                      : "bg-white text-slate-700 border-2 border-slate-200 hover:border-primary hover:text-primary"
                  }`}
                >
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Ranking
                </Button>
                <Button
                  onClick={() => setDashboardView("analysis")}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                    dashboardView === "analysis"
                      ? "bg-primary text-white shadow-md"
                      : "bg-white text-slate-700 border-2 border-slate-200 hover:border-primary hover:text-primary"
                  }`}
                >
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Análisis
                </Button>
              </div>

              {/* Conditional Content Based on Selection */}
              {dashboardView === "ranking" && (
                <RankingTable
                  projects={dashboardData}
                  onProjectSelect={setSelectedDashboardProject}
                  selectedProject={selectedDashboardProject}
                />
              )}

              {dashboardView === "analysis" && <ScoreChart projects={dashboardData} />}

              {/* Project Details (shown when a project is selected in ranking) */}
              {selectedDashboardProject && dashboardView === "ranking" && (
                <ProjectDetails project={dashboardData.find((p: any) => p.id === selectedDashboardProject)} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
