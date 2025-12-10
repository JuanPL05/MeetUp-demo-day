"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, BarChart3 } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ProjectScore {
  id: string
  name: string
  team: string
  program: string
  totalScore: number | null
  averageScore: number | null
  maxPossibleScore: number
  completionPercentage: number
  evaluationCount: number // Number of judges who completed all questions
  totalEvaluations: number // Total individual question evaluations
  totalJudges: number // Total number of judges
  rank: number
  blockAverages: Array<{
    blockName: string
    average: number | null
  }>
}

interface ProjectDetailsProps {
  project: ProjectScore | null
}

export function ProjectDetails({ project }: ProjectDetailsProps) {
  console.log("[v0] ProjectDetails: Displaying project:", project?.name)
  console.log("[v0] ProjectDetails: Project data:", project)

  // Obtener todos los bloques disponibles
  const { data: allBlocks } = useSWR("/api/blocks", fetcher, {
    onSuccess: (data) => console.log("[v0] ProjectDetails: All blocks loaded:", data?.length || 0),
    onError: (error) => console.error("[v0] ProjectDetails: Blocks error:", error),
  })

  if (!project) {
    console.log("[v0] ProjectDetails: No project data provided")
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">No se pudo cargar la información del proyecto</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Combinar todos los bloques con las evaluaciones del proyecto
  const allBlocksWithEvaluations = (allBlocks || []).map((block: any) => {
    const evaluation = project.blockAverages.find((ba: any) => ba.blockName === block.name)
    return {
      blockName: block.name,
      average: evaluation ? evaluation.average : null,
      hasEvaluation: !!evaluation
    }
  }).sort((a, b) => (b.average ?? 0) - (a.average ?? 0))

  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Detalles del Proyecto
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="default">Ranking #{project.rank}</Badge>
            <Badge variant="secondary">{project.program}</Badge>
            <Badge variant="outline">{project.team}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Overview */}
        <div>
          <h3 className="text-2xl font-bold mb-4">{project.name}</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {project.averageScore !== null ? project.averageScore.toFixed(1) : "0.0"}
                </div>
                <div className="text-sm text-muted-foreground">Promedio (base 5 ⭐)</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  {project.totalScore !== null ? project.totalScore.toFixed(1) : "0.0"}
                </div>
                <div className="text-sm text-muted-foreground">Puntuación (base 10)</div>
                <div className="text-xs text-muted-foreground">
                  {project.averageScore ? `${((project.averageScore/5)*100).toFixed(0)}% de aprobación` : '0% de aprobación'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{project.evaluationCount}</div>
                <div className="text-sm text-muted-foreground">Jueces completados</div>
                <div className="text-xs text-muted-foreground">de {project.totalJudges} total</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{Math.round(project.completionPercentage)}%</div>
                <div className="text-sm text-muted-foreground">Completado</div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Progreso de Evaluación</span>
              <span>{Math.round(project.completionPercentage)}%</span>
            </div>
            <Progress value={project.completionPercentage} className="h-3" />
          </div>
        </div>

        {/* Block Breakdown */}
        <div>
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Puntuaciones por Bloque
          </h4>

          <div className="space-y-4">
            {allBlocksWithEvaluations.map((block: any, index: number) => (
              <div key={block.blockName} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{block.blockName}</span>
                    {!block.hasEvaluation && (
                      <Badge variant="secondary" className="text-xs">Sin evaluar</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={index === 0 && block.hasEvaluation ? "default" : "outline"}>
                      {block.average !== null ? block.average.toFixed(1) : "0.0"}/5.0
                    </Badge>
                    {index === 0 && block.hasEvaluation && <Trophy className="w-4 h-4 text-yellow-500" />}
                  </div>
                </div>
                <Progress 
                  value={((block.average ?? 0) / 5) * 100} 
                  className={`h-2 ${!block.hasEvaluation ? 'opacity-50' : ''}`} 
                />
              </div>
            ))}
          </div>
        </div>

        {/* Performance Analysis */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Análisis de Rendimiento</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h5 className="font-medium mb-2">Fortalezas</h5>
                <div className="space-y-1">
                  {allBlocksWithEvaluations
                    .filter((block: any) => block.hasEvaluation && block.average !== null && block.average >= 4.0)
                    .map((block: any) => (
                      <div key={block.blockName} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">
                          {block.blockName} ({block.average !== null ? block.average.toFixed(1) : "0.0"})
                        </span>
                      </div>
                    ))}
                  {allBlocksWithEvaluations.filter((block: any) => block.hasEvaluation && block.average !== null && block.average >= 4.0).length ===
                    0 && <span className="text-sm text-muted-foreground">No hay bloques con puntuación alta</span>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h5 className="font-medium mb-2">Áreas de Mejora</h5>
                <div className="space-y-1">
                  {allBlocksWithEvaluations
                    .filter((block: any) => block.hasEvaluation && block.average !== null && block.average < 3.0)
                    .map((block: any) => (
                      <div key={block.blockName} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm">
                          {block.blockName} ({block.average !== null ? block.average.toFixed(1) : "0.0"})
                        </span>
                      </div>
                    ))}
                  
                  {/* Mostrar bloques sin evaluar como áreas que necesitan atención */}
                  {allBlocksWithEvaluations
                    .filter((block: any) => !block.hasEvaluation)
                    .map((block: any) => (
                      <div key={block.blockName} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">
                          {block.blockName} (Sin evaluar)
                        </span>
                      </div>
                    ))}
                  
                  {allBlocksWithEvaluations.filter((block: any) => 
                    !block.hasEvaluation || (block.hasEvaluation && block.average !== null && block.average < 3.0)
                  ).length === 0 && (
                    <span className="text-sm text-muted-foreground">No hay áreas críticas de mejora</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
