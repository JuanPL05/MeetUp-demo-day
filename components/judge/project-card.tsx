"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock } from "lucide-react"

interface Project {
  id: string
  name: string
  description: string | null
  program: {
    id: string
    name: string
  }
  team: {
    id: string
    name: string
  }
}

interface ProjectCardProps {
  project: Project
  progress: number
  isComplete: boolean
  isSelected: boolean
  onClick: () => void
}

export function ProjectCard({ project, progress, isComplete, isSelected, onClick }: ProjectCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "ring-2 ring-primary" : ""}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary">{project.program.name}</Badge>
              <Badge variant="outline">{project.team.name}</Badge>
            </div>
          </div>
          {isComplete ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <Clock className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground line-clamp-2">{project.description || "Sin descripción"}</p>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Progreso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
