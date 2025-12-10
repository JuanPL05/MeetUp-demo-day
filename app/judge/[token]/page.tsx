"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EvaluationForm } from "@/components/judge/evaluation-form"
import { RankingTable } from "@/components/dashboard/ranking-table"
import { ScoreChart } from "@/components/dashboard/score-chart"
import { ProjectDetails } from "@/components/dashboard/project-details"
import { AlertCircle, CheckCircle, Clock, Trophy, BarChart3, Users, ClipboardList } from "lucide-react"

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
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
        <div className="mb-6 md:mb-8 bg-white rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2">Panel de Evaluación</h1>
              <p className="text-base sm:text-lg text-slate-600">
                Bienvenido, <span className="text-primary font-semibold">{judge?.name || "Juez"}</span>
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg md:rounded-xl p-3 md:p-4 border border-slate-200">
              <div className="flex items-center gap-2 md:gap-3 mb-2">
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6 md:mb-8">
          <TabsList className="grid w-full grid-cols-2 bg-white border-2 border-blue-300 shadow-lg h-10 md:h-12 rounded-xl">
            <TabsTrigger
              value="evaluation"
              className="flex items-center gap-1 md:gap-2 font-bold text-sm md:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-green-500 data-[state=active]:text-white rounded-lg transition-all"
            >
              <ClipboardList className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Evaluación</span>
              <span className="sm:hidden">Eval.</span>
            </TabsTrigger>
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-1 md:gap-2 font-bold text-sm md:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-green-500 data-[state=active]:text-white rounded-lg transition-all"
            >
              <BarChart3 className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="evaluation" className="mt-6">
            <div className="space-y-6">
              <Card className="overflow-hidden border-slate-200 shadow-lg bg-white">
                <CardHeader className="pb-6 bg-slate-50 border-b border-slate-200 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 md:p-4 rounded-xl bg-primary/10">
                        <Users className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-1">Equipos Participantes</h3>
                        <p className="text-sm md:text-base text-slate-600">
                          {projects.length} proyecto{projects.length !== 1 ? "s" : ""} disponible
                          {projects.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-primary text-white text-base md:text-lg font-semibold px-4 md:px-6 py-2 shadow-md">
                      {projects.length}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
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
                          className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 bg-white ${
                            selectedProject === project.id
                              ? "ring-2 ring-primary shadow-xl border-primary"
                              : "hover:shadow-lg border-slate-200 hover:border-primary/50"
                          }`}
                          onClick={() => setSelectedProject(project.id)}
                        >
                          <CardHeader className="pb-3 md:pb-4">
                            <div className="flex items-center justify-between mb-3">
                              <Badge className="bg-primary text-white font-medium px-3 py-1 text-xs md:text-sm">
                                {project.program || "Programa"}
                              </Badge>
                              {isComplete && (
                                <div className="bg-accent rounded-full p-1">
                                  <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>
                            <CardTitle className="text-base md:text-lg font-bold text-slate-900 mb-2">
                              {project.name}
                            </CardTitle>
                            <CardDescription className="text-xs md:text-sm text-slate-600 line-clamp-2 mb-3">
                              {project.description || "Sin descripción"}
                            </CardDescription>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs text-slate-600">
                                <span>Progreso</span>
                                <span className="font-medium">{Math.round(projectProgress)}%</span>
                              </div>
                              <Progress value={projectProgress} className="h-2" />
                            </div>
                          </CardHeader>
                        </Card>
                      )
                    })}
                  </div>
                </CardHeader>
              </Card>

              {projects.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-blue-200 shadow-xl">
                  <AlertCircle className="w-20 h-20 mx-auto mb-6 text-blue-400" />
                  <h3 className="text-2xl font-bold mb-3 text-slate-800">No hay proyectos disponibles</h3>
                  <p className="text-slate-600 text-lg">
                    No se encontraron proyectos para evaluar. Contacta al administrador.
                  </p>
                </div>
              )}
            </div>

            {selectedProject && (
              <div className="mt-6 md:mt-8">
                <Card className="border-slate-200 shadow-lg bg-white">
                  <CardHeader className="bg-slate-50 border-b border-slate-200 p-4 md:p-6">
                    <CardTitle className="flex flex-wrap items-center gap-2 md:gap-4 text-base md:text-xl">
                      <div className="w-1 h-8 bg-primary rounded-full"></div>
                      <span className="break-words flex-1 min-w-0 text-slate-900 font-bold">
                        Evaluando: {projects.find((p) => p.id === selectedProject)?.name}
                      </span>
                      <Badge className="bg-slate-100 text-slate-700 border border-slate-300 text-xs md:text-sm px-3 py-1 font-medium">
                        {projects.find((p) => p.id === selectedProject)?.program}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-8">
                    {(() => {
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
                          <div className="w-full overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-6">
                            <TabsList className="inline-flex h-10 md:h-12 items-center justify-start rounded-lg bg-slate-100 p-1 border border-slate-200 min-w-full">
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
                                    className="relative text-xs md:text-sm px-3 md:px-4 py-2 h-8 md:h-10 whitespace-nowrap flex-shrink-0 font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all"
                                  >
                                    <span className="truncate max-w-[100px] md:max-w-[150px]">{block.name}</span>
                                    {blockProgress === 100 && (
                                      <div className="absolute -top-1 -right-1 bg-accent rounded-full p-0.5">
                                        <CheckCircle className="w-3 h-3 text-white" />
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
                    })()}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="dashboard" className="mt-6">
            <div className="space-y-6">
              <Card className="border-slate-200 shadow-lg bg-white">
                <CardHeader className="bg-slate-50 border-b border-slate-200 p-6">
                  <CardTitle className="flex items-center gap-3 text-xl md:text-2xl text-slate-900 font-bold">
                    <Trophy className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                    Ranking y Análisis de Proyectos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-primary" />
                        Tabla de Posiciones
                      </h3>
                      <RankingTable
                        projects={dashboardData}
                        onProjectSelect={setSelectedDashboardProject}
                        selectedProject={selectedDashboardProject}
                      />
                    </div>

                    <div className="border-t border-slate-200 pt-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-accent" />
                        Comparación de Promedios
                      </h3>
                      <ScoreChart projects={dashboardData} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedDashboardProject && (
                <Card className="border-slate-200 shadow-lg bg-white">
                  <CardHeader className="bg-slate-50 border-b border-slate-200 p-6">
                    <CardTitle className="flex items-center gap-3 text-xl md:text-2xl text-slate-900 font-bold">
                      <BarChart3 className="w-6 h-6 md:w-7 md:h-7 text-accent" />
                      Análisis Detallado del Proyecto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    <ProjectDetails project={dashboardData.find((p: any) => p.id === selectedDashboardProject)} />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
