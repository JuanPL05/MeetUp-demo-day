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
      <Card className="bg-gradient-to-br from-white to-blue-50/30 border-blue-200/50 shadow-lg backdrop-blur-sm">
        <CardHeader className="border-b border-blue-200/30 bg-gradient-to-r from-blue-50/50 to-green-50/30">
          <CardTitle className="text-slate-800 font-semibold">Ranking de Proyectos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
      <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 rounded-full flex items-center justify-center text-sm font-semibold text-slate-700 shadow-sm">
        {rank}
      </div>
    )
  }

  const handleProjectClick = (projectId: string) => {
    console.log("[v0] RankingTable: Project selected:", projectId)
    onProjectSelect(projectId)
  }

  return (
    <Card className="bg-gradient-to-br from-white to-blue-50/30 border-blue-200/50 shadow-lg backdrop-blur-sm">
      <CardHeader className="border-b border-blue-200/30 bg-gradient-to-r from-blue-50/50 to-green-50/30">
        <CardTitle className="flex items-center gap-3 text-slate-800 font-semibold text-xl">
          <Trophy className="w-6 h-6 text-blue-600" />
          Ranking de Proyectos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {projects.map((project) => (
          <Card
            key={project.id}
            className={`transition-all duration-300 border ${
              selectedProject === project.id
                ? "border-blue-300 bg-gradient-to-r from-blue-50 to-green-50/50 shadow-md scale-[1.01]"
                : "border-slate-200 bg-white/80 hover:border-blue-200 hover:shadow-md hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-green-50/20"
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center gap-2">
                    {getRankIcon(project.rank)}
                    <Badge variant="outline" className="text-xs font-medium border-slate-300 text-slate-600">
                      #{project.rank}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold text-2xl text-slate-800">{project.name}</h3>
                    <div className="flex gap-3 mt-3">
                      <Badge className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200">{project.program}</Badge>
                      <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                        Área: {project.team}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                      {(project.averageScore || 0).toFixed(1)}
                    </div>
                    <div className="text-sm text-slate-600 font-medium">{project.evaluationCount} evaluaciones</div>
                  </div>
                  <Button
                    onClick={() => handleProjectClick(project.id)}
                    variant={selectedProject === project.id ? "default" : "outline"}
                    size="lg"
                    className={`font-medium transition-all duration-300 ${
                      selectedProject === project.id
                        ? "bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-md"
                        : "border-slate-300 text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 hover:border-blue-300"
                    }`}
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    Ver Detalles
                  </Button>
                </div>
              </div>

              {project.blockAverages && project.blockAverages.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {project.blockAverages.map((block) => (
                      <div key={block.blockName} className="text-center">
                        <div className="text-xs text-slate-500 mb-2 font-medium">{block.blockName}</div>
                        <Badge
                          variant="outline"
                          className="text-sm font-semibold border-blue-200 text-blue-700 bg-blue-50/50"
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
