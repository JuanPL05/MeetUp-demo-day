"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RankingTable } from "@/components/dashboard/ranking-table"
import { ScoreChart } from "@/components/dashboard/score-chart"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ProjectDetails } from "@/components/dashboard/project-details"
import { Trophy, BarChart3, RefreshCw, Eye } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ProjectScore {
  id: string
  name: string
  team: string
  program: string
  totalScore: number
  averageScore: number
  maxPossibleScore: number
  completionPercentage: number
  evaluationCount: number
  rank: number
  blockAverages: Array<{
    blockName: string
    average: number
  }>
}

export default function DashboardPage() {
  const [selectedProgram, setSelectedProgram] = useState<string>("all")
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("rankings")

  const {
    data: projectScores,
    error,
    isLoading,
  } = useSWR<ProjectScore[]>("/api/dashboard", fetcher, {
    refreshInterval: 2000,
  })

  const { data: programs } = useSWR("/api/programs", fetcher)
  const { data: judgeStats } = useSWR("/api/dashboard/judge-stats", fetcher)

  const handleProjectSelect = (projectId: string) => {
    console.log("[v0] Dashboard: Project selected:", projectId)
    setSelectedProject(projectId)
    setActiveTab("details")
    console.log("[v0] Dashboard: Switched to details tab")
  }

  const handleTabChange = (value: string) => {
    console.log("[v0] Dashboard: Tab changed from", activeTab, "to", value)
    setActiveTab(value)
    if (value === "analytics") {
      console.log("[v0] Dashboard: Analytics tab activated, ScoreChart should render")
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive text-2xl">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Unable to load dashboard data. Please try refreshing the page or contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading || !projectScores) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 mx-auto mb-6 animate-spin text-primary" />
          <p className="text-xl font-semibold mb-2">Loading Dashboard...</p>
          <p className="text-muted-foreground">Please wait while we fetch your data</p>
        </div>
      </div>
    )
  }

  // Filter projects by program
  const filteredProjects =
    selectedProgram === "all"
      ? projectScores
      : projectScores.filter((project) => project.program === programs?.find((p) => p.id === selectedProgram)?.name)

  // Recalculate rankings for filtered projects
  const rankedFilteredProjects = filteredProjects
    .sort((a, b) => b.averageScore - a.averageScore)
    .map((project, index) => ({
      ...project,
      rank: index + 1,
    }))

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3 retro-glow">
                <Trophy className="w-10 h-10 text-primary" />
                PITCH DAY DASHBOARD
              </h1>
              <p className="text-muted-foreground text-lg font-mono tracking-wide">
                REAL-TIME EVALUATION TRACKING AND ANALYTICS
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-md px-4 py-2 bg-card">
                <RefreshCw className="w-4 h-4 text-primary animate-pulse" />
                <span className="font-mono tracking-wide">AUTO-REFRESH: 2S</span>
              </div>
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger className="w-48 retro-border">
                  <SelectValue placeholder="Select Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs?.map((program: any) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards projects={rankedFilteredProjects} />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
            <TabsTrigger
              value="rankings"
              className="flex items-center gap-2 font-mono tracking-wide text-xs hover:shadow-[0_0_15px_hsl(var(--primary))] transition-all duration-300"
            >
              <Trophy className="w-4 h-4" />
              RANKINGS
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center gap-2 font-mono tracking-wide text-xs hover:shadow-[0_0_15px_hsl(var(--primary))] transition-all duration-300"
            >
              <BarChart3 className="w-4 h-4" />
              ANÁLISIS
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="flex items-center gap-2 font-mono tracking-wide text-xs hover:shadow-[0_0_15px_hsl(var(--primary))] transition-all duration-300"
            >
              <Eye className="w-4 h-4" />
              DETALLES
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rankings">
            <RankingTable
              projects={rankedFilteredProjects}
              onProjectSelect={handleProjectSelect}
              selectedProject={selectedProject}
            />
          </TabsContent>

          <TabsContent value="analytics">
            {console.log(
              "[v0] Dashboard: Analytics TabsContent is rendering, projects count:",
              rankedFilteredProjects?.length || 0,
            )}
            <div className="grid gap-6">
              <ScoreChart projects={rankedFilteredProjects} />

              <Card className="border-2 border-primary/20 bg-gradient-to-br from-white/95 via-white/90 to-white/95 backdrop-blur-sm shadow-xl">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">📈</span>
                    </div>
                    Análisis de rendimiento por bloque
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {rankedFilteredProjects.length > 0 &&
                      rankedFilteredProjects[0].blockAverages.map((block, index) => {
                        const allBlockScores = rankedFilteredProjects
                          .flatMap((p) => p.blockAverages)
                          .filter((b) => b.blockName === block.blockName)
                          .map((b) => b.average)

                        const avgScore = allBlockScores.reduce((sum, score) => sum + score, 0) / allBlockScores.length
                        const maxScore = Math.max(...allBlockScores)
                        const minScore = Math.min(...allBlockScores)

                        // Colores por bloque siguiendo la paleta
                        const blockColors = [
                          "from-emerald-500 to-emerald-600", // Verde
                          "from-blue-500 to-blue-600", // Azul
                          "from-violet-500 to-violet-600", // Violeta
                          "from-amber-500 to-amber-600", // Ámbar
                          "from-red-500 to-red-600", // Rojo
                        ]

                        const gradientColor = blockColors[index % blockColors.length]

                        return (
                          <div key={block.blockName} className="p-6 bg-gradient-to-r from-white/80 to-white/95 border-2 border-primary/10 rounded-2xl shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                            <div className="flex justify-between items-center mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 bg-gradient-to-r ${gradientColor} rounded-full shadow-lg`}></div>
                                <h3 className="text-lg font-bold text-foreground">{block.blockName}</h3>
                              </div>
                              <div className="flex gap-3">
                                <div className="text-center px-3 py-1 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg">
                                  <div className="text-xs text-green-600 font-medium">PROMEDIO</div>
                                  <div className="text-sm font-bold text-green-700">{avgScore.toFixed(1)}</div>
                                </div>
                                <div className="text-center px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                                  <div className="text-xs text-blue-600 font-medium">MÁXIMO</div>
                                  <div className="text-sm font-bold text-blue-700">{maxScore.toFixed(1)}</div>
                                </div>
                                <div className="text-center px-3 py-1 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg">
                                  <div className="text-xs text-red-600 font-medium">MÍNIMO</div>
                                  <div className="text-sm font-bold text-red-700">{minScore.toFixed(1)}</div>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Rendimiento promedio</span>
                                <span className="font-semibold text-foreground">{avgScore.toFixed(1)}/5.0 ({Math.round((avgScore / 5) * 100)}%)</span>
                              </div>
                              <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                                <div
                                  className={`h-full bg-gradient-to-r ${gradientColor} rounded-full transition-all duration-700 shadow-sm`}
                                  style={{
                                    width: `${(avgScore / 5) * 100}%`,
                                  }}
                                />
                              </div>
                              <div className="text-xs text-muted-foreground text-center">
                                Basado en {allBlockScores.length} evaluaciones
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="details">
            {selectedProject ? (
              <ProjectDetails
                project={rankedFilteredProjects.find((p) => p.id === selectedProject)!}
                onClose={() => setSelectedProject(null)}
              />
            ) : (
              <Card className="retro-border bg-card shadow-[0_0_20px_hsl(var(--primary))_/_0.1] border-primary/20">
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Eye className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-semibold font-mono tracking-wide retro-glow text-primary">
                      SELECCIONAR PROYECTO
                    </p>
                    <p className="text-muted-foreground mt-2 font-mono text-sm tracking-wide">
                      ELIGE UN PROYECTO DEL RANKING PARA VER ANÁLISIS DETALLADO
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
