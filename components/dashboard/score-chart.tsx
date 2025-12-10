"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProjectScore {
  id: string
  name: string
  team: string
  teamDescription?: string
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

interface ScoreChartProps {
  projects: ProjectScore[]
}

export function ScoreChart({ projects }: ScoreChartProps) {
  console.log("[v0] ScoreChart: Component mounted with projects:", projects?.length || 0)

  if (!projects || projects.length === 0) {
    console.log("[v0] ScoreChart: No projects data available")
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-white/95 via-white/90 to-white/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">📊</span>
            </div>
            Comparación de puntuaciones por programa
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
              <span className="text-4xl">📊</span>
            </div>
            <p className="text-lg font-semibold text-muted-foreground">No hay proyectos disponibles</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Agrupar proyectos por programa
  const projectsByProgram = projects.reduce((acc, project) => {
    const program = project.program || "Sin Programa"
    if (!acc[program]) {
      acc[program] = []
    }
    acc[program].push(project)
    return acc
  }, {} as Record<string, ProjectScore[]>)

  // Ordenar programas: Incubación primero, luego Aceleración, luego otros
  const sortedPrograms = Object.keys(projectsByProgram).sort((a, b) => {
    const order = ["Incubación", "Aceleración"]
    const aIndex = order.indexOf(a)
    const bIndex = order.indexOf(b)
    
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    return a.localeCompare(b)
  })

  console.log("[v0] ScoreChart: Projects grouped by program:", Object.keys(projectsByProgram))

  // Colores modernos que siguen la paleta de la app
  const blockColors = [
    "#10b981", // emerald-500
    "#3b82f6", // blue-500
    "#8b5cf6", // violet-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#06b6d4", // cyan-500
  ]

  // Configuración de colores por programa
  const programConfig = {
    "Incubación": {
      gradient: "from-emerald-50 to-emerald-100/50",
      border: "border-emerald-200",
      accent: "text-emerald-600",
      bgColor: "bg-emerald-50/80"
    },
    "Aceleración": {
      gradient: "from-blue-50 to-blue-100/50", 
      border: "border-blue-200",
      accent: "text-blue-600",
      bgColor: "bg-blue-50/80"
    },
    default: {
      gradient: "from-gray-50 to-gray-100/50",
      border: "border-gray-200", 
      accent: "text-gray-600",
      bgColor: "bg-gray-50/80"
    }
  }

  // Función para procesar datos de un programa
  const processProjectsData = (programProjects: ProjectScore[]) => {
    return programProjects.slice(0, 5).map((project) => {
      console.log("[v0] ScoreChart: Processing project:", project.name)

      const data: any = {
        name: project.name.length > 15 ? project.name.substring(0, 15) + "..." : project.name,
        promedio: Math.round(project.averageScore * 10) / 10,
        team: project.team,
        program: project.program,
      }

      if (project.blockAverages && Array.isArray(project.blockAverages)) {
        project.blockAverages.forEach((block) => {
          if (block && block.blockName && typeof block.average === "number" && !isNaN(block.average)) {
            data[block.blockName] = Math.round(block.average * 10) / 10
          }
        })
      }

      console.log("[v0] ScoreChart: Processed data for", project.name, ":", data)
      return data
    })
  }

  // Obtener nombres de bloques (usando el primer proyecto que tenga datos)
  const getBlockNames = (programProjects: ProjectScore[]) => {
    const projectWithBlocks = programProjects.find(p => p.blockAverages && Array.isArray(p.blockAverages) && p.blockAverages.length > 0)
    return projectWithBlocks && projectWithBlocks.blockAverages
      ? projectWithBlocks.blockAverages
          .filter((block) => block && block.blockName && typeof block.blockName === "string")
          .map((block) => block.blockName)
      : []
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-white/95 via-white/90 to-white/95 backdrop-blur-sm shadow-xl">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">📊</span>
          </div>
          Comparación de puntuaciones por programa
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        {sortedPrograms.length > 0 ? (
          <div className="space-y-12">
            {sortedPrograms.map((programName) => {
              const programProjects = projectsByProgram[programName]
              const chartData = processProjectsData(programProjects)
              const blockNames = getBlockNames(programProjects)
              const hasValidData = chartData.length > 0 && blockNames.length > 0
              const config = programConfig[programName as keyof typeof programConfig] || programConfig.default

              console.log(`[v0] ScoreChart: Rendering program ${programName} with ${programProjects.length} projects`)

              return (
                <div key={programName} className={`bg-gradient-to-br ${config.gradient} border-2 ${config.border} rounded-3xl p-8 backdrop-blur-sm`}>
                  {/* Header del programa */}
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/50">
                    <div>
                      <h3 className={`text-3xl font-bold ${config.accent} mb-2`}>
                        Programa de {programName}
                      </h3>
                      <p className="text-muted-foreground text-lg">
                        {programProjects.length} equipo{programProjects.length !== 1 ? 's' : ''} participante{programProjects.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className={`px-6 py-3 ${config.bgColor} rounded-2xl border ${config.border}`}>
                      <span className={`text-2xl font-bold ${config.accent}`}>
                        {programProjects.length}
                      </span>
                    </div>
                  </div>

                  {hasValidData ? (
                    <div className="space-y-8">
                      {/* Legend */}
                      <div className="flex flex-wrap gap-4 justify-center p-6 bg-white/60 border-2 border-white/40 rounded-2xl backdrop-blur-sm">
                        {blockNames.map((blockName, index) => (
                          <div key={blockName} className="flex items-center gap-3 bg-white/90 px-4 py-2 rounded-full shadow-sm border border-white/60">
                            <div 
                              className="w-4 h-4 rounded-full shadow-lg" 
                              style={{ backgroundColor: blockColors[index % blockColors.length] }}
                            />
                            <span className="text-sm font-semibold text-foreground">{blockName}</span>
                          </div>
                        ))}
                      </div>

                      {/* Projects Chart */}
                      <div className="space-y-6">
                        {chartData.map((project) => (
                          <div
                            key={project.name}
                            className="p-6 bg-white/80 border-2 border-white/60 rounded-2xl shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:bg-white/90"
                          >
                            <div className="flex items-center justify-between mb-6">
                              <div>
                                <h4 className="text-xl font-bold text-foreground mb-1">{project.name}</h4>
                                <div className="space-y-1">
                                  <div className="flex gap-2">
                                    <span className="text-sm text-muted-foreground">Área: {project.team}</span>
                                    <span className={`text-sm font-semibold ${config.accent}`}>• {project.program}</span>
                                  </div>
                                  {project.teamDescription && (
                                    <div className="text-sm text-muted-foreground">
                                      <span className="font-medium">Descripción: </span>
                                      {project.teamDescription}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-3xl font-bold ${config.accent}`}>
                                  {project.promedio.toFixed(1)}
                                </div>
                                <div className="text-sm text-muted-foreground">Promedio</div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                              {blockNames.map((blockName, blockIndex) => {
                                const score = project[blockName] || 0
                                const percentage = (score / 5) * 100
                                return (
                                  <div key={blockName} className="space-y-3">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm font-medium text-muted-foreground">{blockName}</span>
                                      <span className="text-sm font-bold text-foreground">{score.toFixed(1)}/5.0</span>
                                    </div>
                                    <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                                      <div 
                                        className="h-full rounded-full transition-all duration-700 shadow-sm" 
                                        style={{ 
                                          width: `${percentage}%`,
                                          backgroundColor: blockColors[blockIndex % blockColors.length]
                                        }} 
                                      />
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className={`w-20 h-20 mx-auto mb-6 ${config.bgColor} rounded-full flex items-center justify-center border-2 ${config.border}`}>
                        <span className="text-4xl">📈</span>
                      </div>
                      <p className={`text-xl font-semibold ${config.accent} mb-2`}>
                        No hay evaluaciones para {programName}
                      </p>
                      <p className="text-muted-foreground">Los datos aparecerán aquí una vez que se completen las evaluaciones</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
              <span className="text-5xl">📈</span>
            </div>
            <p className="text-xl font-semibold text-muted-foreground mb-2">No hay proyectos disponibles</p>
            <p className="text-muted-foreground">Los datos aparecerán aquí una vez que se registren proyectos</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
