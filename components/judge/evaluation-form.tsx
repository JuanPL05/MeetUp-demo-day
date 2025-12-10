"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, CheckCircle } from "lucide-react"

interface Block {
  id: string
  name: string
  description: string | null
  order: number
}

interface Question {
  id: string
  text: string
  description?: string
  score?: number // Added score field to Question interface
  order: number
  blockId: string
}

interface Evaluation {
  id: string
  score: number
  judgeId: string
  projectId: string
  questionId: string
}

interface EvaluationFormProps {
  block: Block
  questions: Question[]
  projectId: string
  judgeId: string
  evaluations: Evaluation[]
  onEvaluationChange: () => void
}

export function EvaluationForm({
  block,
  questions,
  projectId,
  judgeId,
  evaluations,
  onEvaluationChange,
}: EvaluationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null)

  const sortedQuestions = questions.sort((a, b) => a.order - b.order)

  // Debug: Log questions received
  console.log("[DEBUG] EvaluationForm questions received:", {
    blockName: block.name,
    questionsCount: questions.length,
    questionsWithScores: questions.map(q => ({
      id: q.id,
      text: q.text?.substring(0, 40) + '...',
      score: q.score,
      scoreType: typeof q.score
    }))
  })

  const handleScoreChange = async (questionId: string, starRating: number) => {
    setIsSubmitting(questionId)

    try {
      const requestBody = {
        score: starRating,
        judgeId,
        projectId,
        questionId,
      }

      const response = await fetch("/api/evaluations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        onEvaluationChange()
      } else {
        const errorText = await response.text()
        alert(`Error saving evaluation: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      alert(`Exception saving evaluation: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsSubmitting(null)
    }
  }

  const getEvaluationScore = (questionId: string): number | null => {
    const evaluation = evaluations.find((e) => e.projectId === projectId && e.questionId === questionId)
    return evaluation ? evaluation.score : null
  }

  const getStarRating = (questionId: string): number | null => {
    return getEvaluationScore(questionId)
  }

  return (
    <div className="space-y-8">
      <div className="text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {block.name}
        </h3>
        {block.description && <p className="text-muted-foreground mt-3 text-lg leading-relaxed">{block.description}</p>}
      </div>

      <div className="space-y-8">
        {sortedQuestions.map((question) => {
          const currentStarRating = getStarRating(question.id)
          const currentActualScore = getEvaluationScore(question.id)
          const isLoading = isSubmitting === question.id
          
          // Convert score to number properly (handling both string and number types from database)
          let maxScore = 0.5 // fallback
          if (question.score !== null && question.score !== undefined) {
            if (typeof question.score === 'string') {
              const parsed = parseFloat(question.score)
              maxScore = !isNaN(parsed) ? parsed : 0.5
            } else if (typeof question.score === 'number') {
              maxScore = question.score
            }
          }

          // Debug all questions to see their scores
          console.log("[DEBUG] Question processing:", {
            id: question.id,
            text: question.text?.substring(0, 50) + '...',
            score: question.score,
            scoreType: typeof question.score,
            maxScoreCalculated: maxScore,
            isVentasQuestion: question.text?.includes("datos claros de ventas")
          })

          return (
            <Card
              key={question.id}
              className="overflow-hidden border-2 hover:border-primary/30 transition-all duration-300"
            >
              <CardHeader className="bg-gradient-to-r from-muted/50 to-background">
                <CardTitle className="text-xl flex items-center gap-3">
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white shadow-md">
                    {question.order}
                  </Badge>
                  <span className="flex-1">{question.text}</span>
                  <Badge variant="outline" className="text-sm font-medium border-accent text-accent">
                    Máx: {maxScore.toFixed(2)} pts
                  </Badge>
                </CardTitle>
                {question.description && (
                  <p className="text-muted-foreground mt-3 text-base leading-relaxed pl-12">{question.description}</p>
                )}
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex items-center justify-center gap-3 mb-6">
                  {[1, 2, 3, 4, 5].map((starRating) => {
                    const isSelected = currentStarRating === starRating
                    return (
                      <Button
                        key={starRating}
                        variant="outline"
                        size="lg"
                        className={`w-20 h-20 text-lg transition-all duration-300 relative ${
                          isSelected ? "star-selected border-0" : "star-unselected"
                        }`}
                        onClick={() => handleScoreChange(question.id, starRating)}
                        disabled={isLoading}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Star className={`w-7 h-7 ${isSelected ? "fill-current" : "stroke-current"}`} />
                          <span className="text-sm font-semibold">{starRating}</span>
                          {isSelected && <CheckCircle className="w-4 h-4 absolute -top-1 -right-1 text-white" />}
                        </div>
                      </Button>
                    )
                  })}
                </div>

                <div className="text-center space-y-3">
                  <div className="flex justify-between text-sm text-muted-foreground font-medium">
                    <span>Muy Bajo</span>
                    <span>Excelente</span>
                  </div>

                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
                    <div className="text-lg font-bold text-primary">
                      Puntuación:{" "}
                      {currentStarRating !== null ? ((currentStarRating / 5) * maxScore).toFixed(2) : "0.00"} /{" "}
                      {maxScore.toFixed(2)} pts
                    </div>
                    {currentStarRating && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {currentStarRating} {currentStarRating === 1 ? "estrella" : "estrellas"} seleccionada
                        {currentStarRating === 1 ? "" : "s"}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
