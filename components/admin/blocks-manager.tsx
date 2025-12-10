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

interface Block {
  id: string
  name: string
  description: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export function BlocksManager() {
  const { data: blocks, error, mutate } = useSWR<Block[]>("/api/blocks", fetcher)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBlock, setEditingBlock] = useState<Block | null>(null)
  const [formData, setFormData] = useState({ name: "", description: "", order: 0 })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const method = editingBlock ? "PUT" : "POST"
    const url = editingBlock ? `/api/blocks/${editingBlock.id}` : "/api/blocks"

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })

    if (response.ok) {
      mutate()
      setIsDialogOpen(false)
      setEditingBlock(null)
      setFormData({ name: "", description: "", order: 0 })
    }
  }

  const handleEdit = (block: Block) => {
    setEditingBlock(block)
    setFormData({
      name: block.name,
      description: block.description || "",
      order: block.order,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este bloque?")) {
      const response = await fetch(`/api/blocks/${id}`, { method: "DELETE" })
      if (response.ok) {
        mutate()
      }
    }
  }

  const openCreateDialog = () => {
    setEditingBlock(null)
    setFormData({ name: "", description: "", order: (blocks?.length || 0) + 1 })
    setIsDialogOpen(true)
  }

  if (error) return <div className="text-center py-8 text-destructive">Error al cargar bloques</div>
  if (!blocks) return <div className="text-center py-8 text-muted-foreground">Cargando...</div>

  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h3 className="text-lg md:text-xl font-semibold">Bloques ({blocks.length})</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Bloque
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md">
            <DialogHeader>
              <DialogTitle>{editingBlock ? "Editar Bloque" : "Crear Bloque"}</DialogTitle>
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
                <Label htmlFor="order">Orden</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: Number.parseInt(e.target.value) })}
                  required
                  className="mt-1.5"
                />
              </div>
              <Button type="submit" className="w-full">
                {editingBlock ? "Actualizar" : "Crear"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 md:gap-4">
        {sortedBlocks.map((block) => (
          <Card key={block.id} className="overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-3">
              <CardTitle className="text-sm md:text-base break-words pr-2">
                {block.order}. {block.name}
              </CardTitle>
              <div className="flex space-x-2 self-end sm:self-auto">
                <Button variant="outline" size="sm" onClick={() => handleEdit(block)}>
                  <Edit className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="ml-1.5 hidden sm:inline text-xs">Editar</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(block.id)}>
                  <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="ml-1.5 hidden sm:inline text-xs">Eliminar</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs md:text-sm text-muted-foreground break-words">
                {block.description || "Sin descripción"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
