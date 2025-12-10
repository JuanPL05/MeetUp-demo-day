"use client"

import type React from "react"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Copy, ExternalLink, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Judge {
  id: string
  name: string
  email: string
  token: string
  createdAt: string
  updatedAt: string
}

export function JudgesManager() {
  const { data: judges, error, mutate } = useSWR<Judge[]>("/api/judges", fetcher)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingJudge, setEditingJudge] = useState<Judge | null>(null)
  const [formData, setFormData] = useState({ name: "", email: "" })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const method = editingJudge ? "PUT" : "POST"
    const url = editingJudge ? `/api/judges/${editingJudge.id}` : "/api/judges"

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })

    if (response.ok) {
      mutate()
      setIsDialogOpen(false)
      setEditingJudge(null)
      setFormData({ name: "", email: "" })
    }
  }

  const handleEdit = (judge: Judge) => {
    setEditingJudge(judge)
    setFormData({ name: judge.name, email: judge.email })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este juez?")) return

    const response = await fetch(`/api/judges/${id}`, { method: "DELETE" })
    if (response.ok) {
      mutate()
    }
  }

  const copyJudgeLink = (token: string) => {
    const url = `${window.location.origin}/judge/${token}`
    navigator.clipboard.writeText(url)
    toast({
      title: "Enlace copiado",
      description: "El enlace del juez ha sido copiado al portapapeles",
    })
  }

  const openJudgeLink = (token: string) => {
    const url = `${window.location.origin}/judge/${token}`
    window.open(url, "_blank")
  }

  const handleCloseVoting = async () => {
    if (
      !confirm("¿Estás seguro de que quieres cerrar la votación? Esto deshabilitará todos los enlaces de los jueces.")
    ) {
      return
    }

    try {
      const response = await fetch("/api/judges/close-voting", { method: "POST" })
      if (response.ok) {
        const result = await response.json()
        await mutate() // Refresh the judges list
        toast({
          title: "Votación Cerrada",
          description: result.message,
        })
      } else {
        throw new Error("Error closing voting")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar la votación",
        variant: "destructive",
      })
    }
  }

  if (error) return <div>Error cargando jueces</div>
  if (!judges) return <div>Cargando...</div>

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-bold">Gestión de Jueces</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <Button
            variant="destructive"
            onClick={handleCloseVoting}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Lock className="w-4 h-4" />
            <span className="text-sm">Cerrar Votación</span>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingJudge(null)
                  setFormData({ name: "", email: "" })
                }}
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Juez
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md">
              <DialogHeader>
                <DialogTitle>{editingJudge ? "Editar Juez" : "Agregar Juez"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingJudge ? "Actualizar" : "Crear"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {judges.map((judge) => (
          <Card key={judge.id} className="border-slate-200">
            <CardHeader className="flex flex-col space-y-2 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-sm sm:text-base">{judge.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {judge.email}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyJudgeLink(judge.token)}
                    title="Copiar enlace"
                    className="flex-1 sm:flex-none"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openJudgeLink(judge.token)}
                    title="Abrir enlace"
                    className="flex-1 sm:flex-none"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(judge)} className="flex-1 sm:flex-none">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(judge.id)}
                    className="flex-1 sm:flex-none"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600 break-all">
                Token: {judge.token}
                {judge.token.startsWith("DISABLED_") && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    DESHABILITADO
                  </Badge>
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
