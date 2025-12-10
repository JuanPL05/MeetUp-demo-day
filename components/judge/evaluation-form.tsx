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
    questionsWithScores: questions.map((q) => ({
      id: q.id,
      text: q.text?.substring(0, 40) + "...",
      score: q.score,
      scoreType: typeof q.score,
    })),
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
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div className="text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-primary/20">
        <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {block.name}
        </h3>
        {block.description && (
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground mt-1 sm:mt-2 md:mt-3 leading-relaxed">
            {block.description}
          </p>
        )}
      </div>

      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        {sortedQuestions.map((question) => {
          const currentStarRating = getStarRating(question.id)
          const currentActualScore = getEvaluationScore(question.id)
          const isLoading = isSubmitting === question.id

          // Convert score to number properly (handling both string and number types from database)
          let maxScore = 0.5 // fallback
          if (question.score !== null && question.score !== undefined) {
            if (typeof question.score === "string") {
              const parsed = Number.parseFloat(question.score)
              maxScore = !isNaN(parsed) ? parsed : 0.5
            } else if (typeof question.score === "number") {
              maxScore = question.score
            }
          }

          // Debug all questions to see their scores
          console.log("[DEBUG] Question processing:", {
            id: question.id,
            text: question.text?.substring(0, 50) + "...",
            score: question.score,
            scoreType: typeof question.score,
            maxScoreCalculated: maxScore,
            isVentasQuestion: question.text?.includes("datos claros de ventas"),
          })

          return (
            <Card
              key={question.id}
              className="overflow-hidden border-2 hover:border-primary/30 transition-all duration-300"
            >
              <CardHeader className="bg-gradient-to-r from-muted/50 to-background p-3 sm:p-4 md:p-6">
                <CardTitle className="text-sm sm:text-base md:text-lg lg:text-xl flex flex-wrap items-center gap-2 md:gap-3">
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white shadow-md text-xs sm:text-sm md:text-base px-2 md:px-3 py-0.5 sm:py-1 flex-shrink-0">
                    {question.order}
                  </Badge>
                  <span className="flex-1 min-w-0 break-words">{question.text}</span>
                  <Badge
                    variant="outline"
                    className="text-xs md:text-sm font-medium border-accent text-accent whitespace-nowrap flex-shrink-0"
                  >
                    Máx: {maxScore.toFixed(2)} pts
                  </Badge>
                </CardTitle>
                {question.description && (
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1 sm:mt-2 md:mt-3 leading-relaxed pl-0 md:pl-12">
                    {question.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 md:gap-3 mb-3 sm:mb-4 md:mb-6">
                  {[1, 2, 3, 4, 5].map((starRating) => {
                    const isSelected = currentStarRating === starRating
                    return (
                      <Button
                        key={starRating}
                        variant="outline"
                        size="lg"
                        className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 text-sm sm:text-base md:text-lg transition-all duration-300 relative ${
                          isSelected ? "star-selected border-0" : "star-unselected"
                        }`}
                        onClick={() => handleScoreChange(question.id, starRating)}
                        disabled={isLoading}
                      >
                        <div className="flex flex-col items-center gap-0.5 md:gap-1">
                          <Star
                            className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 ${isSelected ? "fill-current" : "stroke-current"}`}
                          />
                          <span className="text-xs sm:text-sm font-semibold">{starRating}</span>
                          {isSelected && (
                            <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 text-white" />
                          )}
                        </div>
                      </Button>
                    )
                  })}
                </div>

                <div className="text-center space-y-1.5 sm:space-y-2 md:space-y-3">
                  <div className="flex justify-between text-xs sm:text-sm text-muted-foreground font-medium px-2">
                    <span>Muy Bajo</span>
                    <span>Excelente</span>
                  </div>

                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-2 sm:p-3 md:p-4 border border-primary/20">
                    <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-primary">
                      Puntuación:{" "}
                      {currentStarRating !== null ? ((currentStarRating / 5) * maxScore).toFixed(2) : "0.00"} /{" "}
                      {maxScore.toFixed(2)} pts
                    </div>
                    {currentStarRating && (
                      <div className="text-xs sm:text-sm text-muted-foreground mt-1">
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
