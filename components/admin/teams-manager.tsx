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
import { Plus, Edit, Trash2 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Team {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export function TeamsManager() {
  const { data: teams, error, mutate } = useSWR<Team[]>("/api/teams", fetcher)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const method = editingTeam ? "PUT" : "POST"
    const url = editingTeam ? `/api/teams/${editingTeam.id}` : "/api/teams"

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })

    if (response.ok) {
      mutate()
      setIsDialogOpen(false)
      setEditingTeam(null)
      setFormData({ name: "", description: "" })
    }
  }

  const handleEdit = (team: Team) => {
    setEditingTeam(team)
    setFormData({ name: team.name, description: team.description || "" })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este equipo?")) {
      const response = await fetch(`/api/teams/${id}`, { method: "DELETE" })
      if (response.ok) {
        mutate()
      }
    }
  }

  const openCreateDialog = () => {
    setEditingTeam(null)
    setFormData({ name: "", description: "" })
    setIsDialogOpen(true)
  }

  if (error) return <div>Error al cargar equipos</div>
  if (!teams) return <div>Cargando...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Áreas ({teams.length})</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Equipo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTeam ? "Editar Equipo" : "Crear Equipo"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingTeam ? "Actualizar" : "Crear"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">{team.name}</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(team)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(team.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{team.description || "Sin descripción"}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
