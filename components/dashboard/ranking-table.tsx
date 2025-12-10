"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Eye } from "lucide-react"

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

interface RankingTableProps {
  projects: ProjectScore[]
  onProjectSelect: (projectId: string) => void
  selectedProject: string | null
}

export function RankingTable({ projects, onProjectSelect, selectedProject }: RankingTableProps) {
  console.log("[v0] RankingTable: Rendering with projects:", projects?.length || 0)

  if (!projects || projects.length === 0) {
    console.log("[v0] RankingTable: No projects to display")
    return (
      <Card className="bg-white border-slate-200 shadow-lg">
        <CardHeader className="border-b border-slate-200 bg-slate-50">
          <CardTitle className="text-slate-900 font-semibold">Ranking de Proyectos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <p className="text-slate-600">No hay proyectos disponibles</p>
        </CardContent>
      </Card>
    )
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-8 h-8 text-amber-500 drop-shadow-sm" />
    if (rank === 2) return <Trophy className="w-8 h-8 text-slate-400 drop-shadow-sm" />
    if (rank === 3) return <Trophy className="w-8 h-8 text-orange-500 drop-shadow-sm" />
    return (
      <div className="w-8 h-8 bg-slate-100 border border-slate-300 rounded-full flex items-center justify-center text-sm font-semibold text-slate-700 shadow-sm">
        {rank}
      </div>
    )
  }

  const handleProjectClick = (projectId: string) => {
    console.log("[v0] RankingTable: Project selected:", projectId)
    onProjectSelect(projectId)
  }

  return (
    <Card className="bg-white border-slate-200 shadow-lg">
      <CardHeader className="border-b border-slate-200 bg-slate-50">
        <CardTitle className="flex items-center gap-3 text-slate-900 font-semibold text-xl">
          <Trophy className="w-6 h-6 text-blue-600" />
          Ranking de Proyectos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 md:p-6">
        {projects.map((project) => (
          <Card
            key={project.id}
            className={`transition-all duration-300 border-2 ${
              selectedProject === project.id
                ? "border-primary bg-blue-50/50 shadow-md"
                : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"
            }`}
          >
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    {getRankIcon(project.rank)}
                    <Badge variant="outline" className="text-xs font-medium border-slate-300 text-slate-600">
                      #{project.rank}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xl md:text-2xl text-slate-900 mb-2 truncate">{project.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="text-xs bg-primary text-white">{project.program}</Badge>
                      <Badge variant="outline" className="text-xs border-accent text-accent">
                        Área: {project.team}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-4 md:gap-6">
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-primary">
                      {(project.averageScore || 0).toFixed(1)}
                    </div>
                    <div className="text-xs md:text-sm text-slate-600 font-medium">
                      {project.evaluationCount} evaluaciones
                    </div>
                  </div>
                  <Button
                    onClick={() => handleProjectClick(project.id)}
                    size="default"
                    className={`font-medium transition-all duration-300 ${
                      selectedProject === project.id
                        ? "bg-primary text-white hover:bg-primary/90 shadow-md"
                        : "bg-white text-primary border-2 border-primary hover:bg-blue-50"
                    }`}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Ver Detalles</span>
                    <span className="sm:hidden">Ver</span>
                  </Button>
                </div>
              </div>

              {project.blockAverages && project.blockAverages.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                    {project.blockAverages.map((block) => (
                      <div key={block.blockName} className="text-center">
                        <div className="text-xs text-slate-600 mb-2 font-medium truncate">{block.blockName}</div>
                        <Badge
                          variant="outline"
                          className="text-sm font-semibold border-primary text-primary bg-blue-50"
                        >
                          {(block.average || 0).toFixed(1)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}
