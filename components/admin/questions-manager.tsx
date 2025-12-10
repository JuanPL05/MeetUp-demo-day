"use client"

import type React from "react"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Target, Rocket } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Question {
  id: string
  text: string
  description?: string
  blockId: string
  programId: string
  order: number
  score?: number // Added score field to Question interface
  createdAt: string
  updatedAt: string
  block: {
    id: string
    name: string
  } | null
  program: {
    id: string
    name: string
  } | null
}

interface Block {
  id: string
  name: string
}

interface Program {
  id: string
  name: string
}

export function QuestionsManager() {
  const { data: questions, error, mutate } = useSWR<Question[]>("/api/questions", fetcher)
  const { data: blocks } = useSWR<Block[]>("/api/blocks", fetcher)
  const { data: programs } = useSWR<Program[]>("/api/programs", fetcher)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [formData, setFormData] = useState({
    text: "",
    description: "",
    blockId: "",
    programId: "",
    order: 0,
    score: 0.5,
  }) // Added score to formData with default value

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const method = editingQuestion ? "PUT" : "POST"
      const url = editingQuestion ? `/api/questions/${editingQuestion.id}` : "/api/questions"

      console.log("[Frontend] Submitting question:", method, formData)

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      console.log("[Frontend] Response:", response.status, result)

      if (response.ok) {
        mutate()
        setIsDialogOpen(false)
        setEditingQuestion(null)
        setFormData({ text: "", description: "", blockId: "", programId: "", order: 0, score: 0.5 })
        console.log("[Frontend] Question operation successful")
      } else {
        console.error("[Frontend] Error response:", result)
        alert(`Error: ${result.error || "No se pudo guardar la pregunta"}`)
      }
    } catch (error) {
      console.error("[Frontend] Network/Parse error:", error)
      alert(`Error de red: ${error instanceof Error ? error.message : "Error desconocido"}`)
    }
  }

  const handleEdit = (question: Question) => {
    setEditingQuestion(question)
    // Ensure score is within allowed range (0.2 - 1.2)
    const safeScore = question.score || 0.5
    const clampedScore = Math.max(0.2, Math.min(1.2, safeScore))

    setFormData({
      text: question.text,
      description: question.description || "",
      blockId: question.blockId,
      programId: question.programId,
      order: question.order,
      score: clampedScore, // Use clamped score to ensure it's within range
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta pregunta?")) {
      try {
        console.log("[Frontend] Deleting question:", id)

        const response = await fetch(`/api/questions/${id}`, { method: "DELETE" })
        const result = await response.json()

        console.log("[Frontend] Delete response:", response.status, result)

        if (response.ok) {
          mutate()
          console.log("[Frontend] Question deleted successfully")
        } else {
          console.error("[Frontend] Delete error:", result)
          alert(`Error al eliminar: ${result.error || "No se pudo eliminar la pregunta"}`)
        }
      } catch (error) {
        console.error("[Frontend] Delete network error:", error)
        alert(`Error de red al eliminar: ${error instanceof Error ? error.message : "Error desconocido"}`)
      }
    }
  }

  const openCreateDialog = () => {
    setEditingQuestion(null)
    setFormData({ text: "", description: "", blockId: "", programId: "", order: 1, score: 0.5 }) // Include score in create form data
    setIsDialogOpen(true)
  }

  if (error) return <div className="text-center py-8 text-destructive">Error al cargar preguntas</div>
  if (!questions || !blocks || !programs)
    return <div className="text-center py-8 text-muted-foreground">Cargando...</div>

  const questionsByProgram = questions.reduce(
    (acc, question) => {
      const programName = question.program?.name || "Sin Programa"
      if (!acc[programName]) {
        acc[programName] = {}
      }
      const blockName = question.block?.name || "Sin Bloque"
      if (!acc[programName][blockName]) {
        acc[programName][blockName] = []
      }
      acc[programName][blockName].push(question)
      return acc
    },
    {} as Record<string, Record<string, Question[]>>,
  )

  const getProgramIcon = (programName: string) => {
    if (programName.toLowerCase().includes("incubación") || programName.toLowerCase().includes("incubacion")) {
      return <Target className="w-3 h-3 md:w-4 md:h-4" />
    }
    if (programName.toLowerCase().includes("aceleración") || programName.toLowerCase().includes("aceleracion")) {
      return <Rocket className="w-3 h-3 md:w-4 md:h-4" />
    }
    return <Target className="w-3 h-3 md:w-4 md:h-4" />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h3 className="text-lg md:text-xl font-semibold">Preguntas ({questions.length})</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Pregunta
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base md:text-lg">
                {editingQuestion ? "Editar Pregunta" : "Crear Pregunta"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="text" className="text-sm">
                  Pregunta
                </Label>
                <Textarea
                  id="text"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  required
                  className="mt-1.5 text-sm"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sm">
                  Descripción / Criterios Orientadores
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Criterios orientadores para evaluar esta pregunta..."
                  className="mt-1.5 text-sm"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="score" className="text-sm">
                  Puntuación (0.2 - 1.2)
                </Label>
                <Input
                  id="score"
                  type="number"
                  step="0.1"
                  min="0.2"
                  max="1.2"
                  value={formData.score || ""}
                  onChange={(e) => {
                    let value = e.target.value === "" ? 0.5 : Number.parseFloat(e.target.value)
                    if (isNaN(value)) value = 0.5
                    value = Math.max(0.2, Math.min(1.2, value))
                    setFormData({ ...formData, score: value })
                  }}
                  placeholder="Ej: 0.5"
                  required
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Incubación: Total 10 puntos | Aceleración: Total 10 puntos
                </p>
              </div>
              <div>
                <Label htmlFor="programId" className="text-sm">
                  Programa
                </Label>
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
                <Label htmlFor="blockId" className="text-sm">
                  Bloque
                </Label>
                <Select
                  value={formData.blockId}
                  onValueChange={(value) => setFormData({ ...formData, blockId: value })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Selecciona un bloque" />
                  </SelectTrigger>
                  <SelectContent>
                    {blocks.map((block) => (
                      <SelectItem key={block.id} value={block.id}>
                        {block.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="order" className="text-sm">
                  Orden
                </Label>
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
                {editingQuestion ? "Actualizar" : "Crear"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6 md:space-y-8">
        {Object.entries(questionsByProgram).map(([programName, blockGroups]) => (
          <div key={programName} className="border border-border rounded-lg p-4 md:p-6 bg-card/50">
            <div className="flex flex-wrap items-center gap-2 mb-4 md:mb-6">
              {getProgramIcon(programName)}
              <h3 className="text-lg md:text-xl font-bold text-primary uppercase tracking-wide break-words">
                {programName}
              </h3>
              <span className="text-xs md:text-sm text-muted-foreground">
                ({Object.values(blockGroups).flat().length} preguntas)
              </span>
            </div>

            <div className="space-y-4 md:space-y-6">
              {Object.entries(blockGroups).map(([blockName, blockQuestions]) => (
                <div key={blockName}>
                  <h4 className="text-sm md:text-base font-semibold mb-2 md:mb-3 text-foreground/80 break-words">
                    {blockName}
                  </h4>
                  <div className="grid gap-2 md:gap-3">
                    {blockQuestions
                      .sort((a, b) => a.order - b.order)
                      .map((question) => (
                        <Card key={question.id} className="hover:bg-accent/50 transition-colors overflow-hidden">
                          <CardHeader className="flex flex-col space-y-3 pb-3 md:pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-xs md:text-sm mb-2 break-words">
                                  <span className="font-semibold">{question.order}.</span> {question.text}
                                  <span className="ml-2 inline-block text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                                    {question.score || 0.5} pts
                                  </span>
                                </CardTitle>
                                {question.description && (
                                  <p className="text-xs text-muted-foreground mt-1 break-words">
                                    {question.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex space-x-2 self-end sm:self-start">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(question)}>
                                  <Edit className="w-3 h-3 md:w-4 md:h-4" />
                                  <span className="ml-1.5 hidden sm:inline text-xs">Editar</span>
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDelete(question.id)}>
                                  <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                                  <span className="ml-1.5 hidden sm:inline text-xs">Eliminar</span>
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
