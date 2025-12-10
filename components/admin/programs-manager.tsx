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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, RefreshCw, AlertTriangle } from "lucide-react"
import { fetcher, mutatingFetcher } from "@/lib/fetcher"

interface Program {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export function ProgramsManager() {
  const {
    data: programs,
    error,
    mutate,
    isLoading,
  } = useSWR<Program[]>("/api/programs", fetcher, {
    onError: (error) => {
      console.error("[v0] Programs SWR Error:", error)
    },
    onSuccess: (data) => {
      console.log("[v0] Programs loaded successfully:", data?.length || 0, "programs")
    },
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const method = editingProgram ? "PUT" : "POST"
      const url = editingProgram ? `/api/programs/${editingProgram.id}` : "/api/programs"

      await mutatingFetcher(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      mutate()
      setIsDialogOpen(false)
      setEditingProgram(null)
      setFormData({ name: "", description: "" })
      console.log("[v0] Program operation successful:", method, editingProgram?.name || formData.name)
    } catch (error) {
      console.error("[v0] Program submit error:", error)
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (program: Program) => {
    console.log("[v0] Editing program:", program.name)
    setEditingProgram(program)
    setFormData({ name: program.name, description: program.description || "" })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar el programa "${name}"?`)) {
      try {
        console.log("[v0] Deleting program:", name)
        await mutatingFetcher(`/api/programs/${id}`, { method: "DELETE" })
        mutate()
        console.log("[v0] Program deleted successfully:", name)
      } catch (error) {
        console.error("[v0] Delete program error:", error)
        alert(`Error al eliminar el programa: ${error.message}`)
      }
    }
  }

  const openCreateDialog = () => {
    console.log("[v0] Opening create program dialog")
    setEditingProgram(null)
    setFormData({ name: "", description: "" })
    setSubmitError(null)
    setIsDialogOpen(true)
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>
                <strong>Error al cargar programas:</strong>
              </p>
              <p className="text-sm font-mono">{error.message}</p>
              <Button variant="outline" size="sm" onClick={() => mutate()} className="mt-2">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading || !programs) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Programas</h3>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Programa
          </Button>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" />
            <p>Cargando programas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <h3 className="text-base sm:text-lg font-semibold">Programas ({programs.length})</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Programa
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md">
            <DialogHeader>
              <DialogTitle>{editingProgram ? "Editar Programa" : "Crear Programa"}</DialogTitle>
            </DialogHeader>

            {submitError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    {editingProgram ? "Actualizando..." : "Creando..."}
                  </>
                ) : editingProgram ? (
                  "Actualizar"
                ) : (
                  "Crear"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {programs.map((program) => (
          <Card key={program.id} className="border-slate-200">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-2">
              <CardTitle className="text-sm sm:text-base">{program.name}</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(program)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(program.id, program.name)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-slate-600">{program.description || "Sin descripción"}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
