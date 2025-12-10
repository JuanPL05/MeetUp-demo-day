"use client"

import type React from "react"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Project {
  id: string
  name: string
  description: string | null
  programId: string
  teamId: string
  createdAt: string
  updatedAt: string
  program: {
    id: string
    name: string
  }
  team: {
    id: string
    name: string
  }
}

interface Program {
  id: string
  name: string
}

interface Team {
  id: string
  name: string
}

export function ProjectsManager() {
  const { data: projects, error, mutate } = useSWR<Project[]>("/api/projects", fetcher)
  const { data: programs } = useSWR<Program[]>("/api/programs", fetcher)
  const { data: teams } = useSWR<Team[]>("/api/teams", fetcher)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "", programId: "", teamId: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const method = editingProject ? "PUT" : "POST"
    const url = editingProject ? `/api/projects/${editingProject.id}` : "/api/projects"

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })

    if (response.ok) {
      mutate()
      setIsDialogOpen(false)
      setEditingProject(null)
      setFormData({ name: "", description: "", programId: "", teamId: "" })
    }
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description || "",
      programId: project.programId,
      teamId: project.teamId,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este proyecto?")) {
      const response = await fetch(`/api/projects/${id}`, { method: "DELETE" })
      if (response.ok) {
        mutate()
      }
    }
  }

  const openCreateDialog = () => {
    setEditingProject(null)
    setFormData({ name: "", description: "", programId: "", teamId: "" })
    setIsDialogOpen(true)
  }

  if (error) return <div className="text-center py-8 text-destructive">Error al cargar proyectos</div>
  if (!projects || !programs || !teams) return <div className="text-center py-8 text-muted-foreground">Cargando...</div>

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h3 className="text-lg md:text-xl font-semibold">Proyectos ({projects.length})</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Proyecto
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProject ? "Editar Proyecto" : "Crear Proyecto"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1.5"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="programId">Programa</Label>
                <Select
                  value={formData.programId}
                  onValueChange={(value) => setFormData({ ...formData, programId: value })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Selecciona un programa" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="teamId">Equipo</Label>
                <Select value={formData.teamId} onValueChange={(value) => setFormData({ ...formData, teamId: value })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Selecciona un equipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                {editingProject ? "Actualizar" : "Crear"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 md:gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            <CardHeader className="flex flex-col space-y-3 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-2 flex-1 min-w-0">
                  <CardTitle className="text-sm md:text-base break-words">{project.name}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {project.program.name}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {project.team.name}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2 self-end sm:self-start">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(project)}>
                    <Edit className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="ml-1.5 hidden sm:inline text-xs">Editar</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(project.id)}>
                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="ml-1.5 hidden sm:inline text-xs">Eliminar</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs md:text-sm text-muted-foreground break-words">
                {project.description || "Sin descripción"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
