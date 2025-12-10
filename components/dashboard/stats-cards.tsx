"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, BarChart, CheckCircle } from "lucide-react"
import useSWR from "swr"

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

interface StatsCardsProps {
  projects: ProjectScore[]
}

export function StatsCards({ projects }: StatsCardsProps) {
  const { data: judgeStats } = useSWR("/api/dashboard/judge-stats", fetcher)
  
  const totalProjects = projects.length
  const completedProjects = projects.filter((p) => p.completionPercentage === 100).length
  const averageScore = projects.length > 0 ? projects.reduce((sum, p) => sum + p.averageScore, 0) / projects.length : 0
  const totalEvaluations = projects.reduce((sum, p) => sum + p.evaluationCount, 0)

  const stats = [
    {
      title: "Proyectos totales",
      value: totalProjects,
      icon: Trophy,
      description: "Proyectos en evaluación",
    },
    {
      title: "Proyectos completados",
      value: completedProjects,
      icon: CheckCircle,
      description: `${completedProjects} de ${totalProjects} proyectos`,
    },
    {
      title: "Puntuación promedio",
      value: averageScore.toFixed(1),
      icon: BarChart,
      description: "Promedio general",
    },
    {
      title: "Evaluaciones completadas",
      value: judgeStats?.completedJudges || 0,
      icon: Users,
      description: "Jueces que completaron todo",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
