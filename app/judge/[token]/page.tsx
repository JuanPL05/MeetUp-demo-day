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
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Trophy,
  BarChart3,
  Users,
  Zap,
  Rocket,
  Lightbulb,
  ClipboardList,
} from "lucide-react"

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
      <div className="min-h-screen bg-background flex items-center justify-center">
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
                <h3 className="text-xl font-bold mb-3">Base de datos vacía</h3>
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

  const programConfig = {
    Incubación: {
      icon: Users,
      color: "emerald",
      bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100/50",
      borderColor: "border-emerald-200",
      badgeColor: "bg-gradient-to-r from-emerald-500 to-emerald-600",
      glowColor: "shadow-emerald-200/50",
      ringColor: "ring-emerald-500",
      shadowColor: "shadow-lg shadow-emerald-100",
      headerGradient: "linear-gradient(to right, #10b981, #16a34a)",
      borderColor: "#10b981",
    },
    Aceleración: {
      icon: Zap,
      color: "blue",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100/50",
      borderColor: "border-blue-200",
      badgeColor: "bg-gradient-to-r from-blue-500 to-blue-600",
      glowColor: "shadow-blue-200/50",
      ringColor: "ring-blue-500",
      shadowColor: "shadow-lg shadow-blue-100",
      headerGradient: "linear-gradient(to right, #3b82f6, #2563eb)",
      borderColor: "#3b82f6",
    },
    Emprendimiento: {
      icon: Rocket,
      color: "purple",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100/50",
      borderColor: "border-purple-200",
      badgeColor: "bg-gradient-to-r from-purple-500 to-purple-600",
      glowColor: "shadow-purple-200/50",
      ringColor: "ring-purple-500",
      shadowColor: "shadow-lg shadow-purple-100",
      headerGradient: "linear-gradient(to right, #a855f7, #8b5cf6)",
      borderColor: "#a855f7",
    },
    Innovación: {
      icon: Lightbulb,
      color: "amber",
      bgColor: "bg-gradient-to-br from-amber-50 to-amber-100/50",
      borderColor: "border-amber-200",
      badgeColor: "bg-gradient-to-r from-amber-500 to-amber-600",
      glowColor: "shadow-amber-200/50",
      ringColor: "ring-amber-500",
      shadowColor: "shadow-lg shadow-amber-100",
      headerGradient: "linear-gradient(to right, #fde047, #fdba74)",
      borderColor: "#fde047",
    },
    default: {
      icon: AlertCircle,
      color: "slate",
      bgColor: "bg-gradient-to-br from-slate-50 to-slate-100/50",
      borderColor: "border-slate-200",
      badgeColor: "bg-gradient-to-r from-slate-500 to-slate-600",
      glowColor: "shadow-slate-200/50",
      ringColor: "ring-slate-500",
      shadowColor: "shadow-lg shadow-slate-100",
      headerGradient: "linear-gradient(to right, #d1d5db, #e5e7eb)",
      borderColor: "#d1d5db",
    },
  }

  const organizedPrograms =
    projects?.reduce(
      (acc, project) => {
        const programName = project.program || "Sin Programa"
        if (!acc[programName]) {
          acc[programName] = []
        }
        acc[programName].push(project)
        return acc
      },
      {} as Record<string, Project[]>,
    ) || {}

  const sortedPrograms = Object.entries(organizedPrograms).sort(([a], [b]) => {
    const priorityOrder = ["Incubación", "Aceleración", "Emprendimiento", "Innovación"]
    const aIndex = priorityOrder.indexOf(a)
    const bIndex = priorityOrder.indexOf(b)

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    return a.localeCompare(b)
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
        <div className="mb-6 md:mb-8 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 border border-primary/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 md:mb-3">
                Panel de Evaluación
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-medium">
                Bienvenido, <span className="text-primary font-semibold">{judge?.name || "Juez"}</span>
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 border border-border shadow-sm">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-accent flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium">
                  {completedEvaluations} de {totalEvaluations} equipos evaluados
                </span>
              </div>
              <Progress value={progressPercentage} className="w-full md:w-72 h-2 md:h-3" />
              <div className="text-xs text-muted-foreground mt-2 text-center">
                {Math.round(progressPercentage)}% completado
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6 md:mb-8">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border border-border shadow-sm h-10 md:h-12">
            <TabsTrigger
              value="evaluation"
              className="flex items-center gap-1 md:gap-2 font-semibold text-sm md:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white"
            >
              <ClipboardList className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Evaluación</span>
              <span className="sm:hidden">Eval.</span>
            </TabsTrigger>
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-1 md:gap-2 font-semibold text-sm md:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white"
            >
              <BarChart3 className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="evaluation">
            <div className="space-y-6 md:space-y-12">
              {sortedPrograms.map(([programName, programProjects]) => {
                const config = programConfig[programName as keyof typeof programConfig] || programConfig.default
                const IconComponent = config.icon

                return (
                  <Card
                    key={programName}
                    className="overflow-hidden border-2 bg-white/90 backdrop-blur-sm shadow-lg"
                    style={{ borderColor: config.borderColor }}
                  >
                    <CardHeader className="pb-4 md:pb-8" style={{ background: config.headerGradient }}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 md:pb-6 border-b border-border/50">
                        <div className="flex items-center gap-3 md:gap-6">
                          <div
                            className={`p-2 md:p-4 rounded-xl md:rounded-2xl ${config.badgeColor} text-white shadow-lg`}
                          >
                            <IconComponent className="w-6 h-6 md:w-10 md:h-10" />
                          </div>
                          <div>
                            <h3 className="text-lg sm:text-xl md:text-3xl font-bold text-foreground mb-1">
                              <span className="hidden md:inline">Equipo participante de </span>
                              <span className="md:hidden">Equipos </span>
                              {programName}
                            </h3>
                            <p className="text-sm md:text-lg text-muted-foreground">
                              {programProjects.length} proyecto{programProjects.length !== 1 ? "s" : ""} disponible
                              {programProjects.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={`${config.badgeColor} text-white text-base md:text-xl font-bold px-4 md:px-6 py-2 md:py-3 shadow-lg self-start sm:self-auto`}
                        >
                          {programProjects.length}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pt-4">
                        {programProjects.map((project) => {
                          const projectEvaluations = safeEvaluations.filter((e) => e.projectId === project.id)

                          // Calculate questions specific to this project's program
                          const projectQuestions = getQuestionsForProject(project.id)
                          const projectQuestionCount = projectQuestions.length

                          const projectProgress =
                            projectQuestionCount > 0 ? (projectEvaluations.length / projectQuestionCount) * 100 : 0
                          const isComplete = projectProgress === 100

                          return (
                            <Card
                              key={project.id}
                              className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 bg-white/90 backdrop-blur-sm ${
                                selectedProject === project.id
                                  ? `ring-2 md:ring-4 ${config.ringColor} ${config.shadowColor} border-current scale-[1.02] md:scale-105`
                                  : `hover:shadow-lg ${config.borderColor} hover:border-current/70 hover:scale-[1.02]`
                              }`}
                              onClick={() => setSelectedProject(project.id)}
                            >
                              <CardHeader className="pb-3 md:pb-4">
                                <div className="flex items-center justify-between mb-3 md:mb-4">
                                  <Badge
                                    className={`${config.badgeColor} text-white font-bold px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm shadow-md`}
                                  >
                                    {programName}
                                  </Badge>
                                  {isComplete && (
                                    <div className="bg-accent rounded-full p-0.5 md:p-1">
                                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                    </div>
                                  )}
                                </div>
                                <CardTitle className="text-base md:text-xl font-bold text-foreground mb-2">
                                  {project.name}
                                </CardTitle>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                                    <Users className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                    <span className="font-medium">Área: {project.team || "Sin equipo"}</span>
                                  </div>
                                  {project.teamDescription && (
                                    <div className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                                      <span className="font-medium">Descripción: </span>
                                      {project.teamDescription}
                                    </div>
                                  )}
                                </div>
                              </CardHeader>
                              <CardContent className="p-3 md:p-4">
                                <div className="space-y-3 md:space-y-4">
                                  <div className="flex justify-between text-xs md:text-sm font-medium">
                                    <span>Progreso de Evaluación</span>
                                    <span className="text-primary">{Math.round(projectProgress)}%</span>
                                  </div>
                                  <Progress value={projectProgress} className="h-2 md:h-3" />
                                  <div className="text-xs text-muted-foreground text-center bg-muted/50 rounded-lg py-1.5 md:py-2">
                                    {projectEvaluations.length} de {projectQuestionCount} preguntas evaluadas
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </CardHeader>
                  </Card>
                )
              })}

              {sortedPrograms.length === 0 && (
                <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl border border-border">
                  <AlertCircle className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
                  <h3 className="text-2xl font-bold mb-3">No hay proyectos disponibles</h3>
                  <p className="text-muted-foreground text-lg">
                    No se encontraron proyectos para evaluar. Contacta al administrador.
                  </p>
                </div>
              )}
            </div>

            {selectedProject && (
              <div className="mt-6 md:mt-8">
                <Card className="border-2 border-primary/20 bg-white/95 backdrop-blur-sm shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border p-4 md:p-6">
                    <CardTitle className="flex flex-wrap items-center gap-2 md:gap-4 text-base md:text-2xl">
                      <div className="w-1 md:w-2 h-6 md:h-8 bg-gradient-to-b from-primary to-accent rounded-full"></div>
                      <span className="break-words flex-1 min-w-0">
                        Evaluando: {projects.find((p) => p.id === selectedProject)?.name}
                      </span>
                      <Badge
                        className={`${
                          projects.find((p) => p.id === selectedProject)?.program === "Incubación"
                            ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                            : "bg-gradient-to-r from-blue-500 to-blue-600"
                        } text-white shadow-md text-xs md:text-sm px-2 md:px-3 py-1`}
                      >
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
                          <div className="text-center py-12">
                            <AlertCircle className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
                            <h3 className="text-xl font-bold mb-3">No hay bloques disponibles</h3>
                            <p className="text-muted-foreground">
                              No se encontraron bloques con preguntas para este programa.
                            </p>
                          </div>
                        )
                      }

                      return (
                        <Tabs value={activeBlock} onValueChange={setActiveBlock}>
                          <div className="w-full overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                            <TabsList className="inline-flex h-10 md:h-12 items-center justify-start rounded-lg md:rounded-xl bg-muted/50 p-1 text-muted-foreground min-w-full backdrop-blur-sm">
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
                                    className="relative text-xs md:text-sm px-2 md:px-4 py-1.5 md:py-2 h-8 md:h-10 whitespace-nowrap flex-shrink-0 min-w-0 font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                  >
                                    <span className="truncate max-w-[100px] md:max-w-[120px]">{block.name}</span>
                                    {blockProgress === 100 && (
                                      <div className="absolute -top-0.5 md:-top-1 -right-0.5 md:-right-1 bg-accent rounded-full p-0.5">
                                        <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                                      </div>
                                    )}
                                  </TabsTrigger>
                                )
                              })}
                            </TabsList>
                          </div>

                          {filteredBlocks.map((block) => (
                            <TabsContent key={block.id} value={block.id}>
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

          <TabsContent value="dashboard">
            <Tabs defaultValue="rankings">
              <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border border-border shadow-sm h-10 md:h-12">
                <TabsTrigger
                  value="rankings"
                  className="flex items-center gap-1 md:gap-2 font-semibold text-sm md:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white"
                >
                  <Trophy className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Rankings</span>
                  <span className="sm:hidden">Rank</span>
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="flex items-center gap-1 md:gap-2 font-semibold text-sm md:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white"
                >
                  <BarChart3 className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Análisis</span>
                  <span className="sm:hidden">Stats</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="rankings">
                <RankingTable
                  projects={dashboardData}
                  onProjectSelect={setSelectedDashboardProject}
                  selectedProject={selectedDashboardProject}
                />

                {selectedDashboardProject && (
                  <div className="mt-8">
                    <ProjectDetails project={dashboardData.find((p: any) => p.id === selectedDashboardProject)} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="analytics">
                <div className="grid gap-8">
                  <ScoreChart projects={dashboardData} />
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
