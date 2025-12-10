"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, RefreshCw, CheckCircle, AlertTriangle, Zap } from "lucide-react"
import { fetcher } from "@/lib/fetcher"

interface DatabaseStatus {
  status: string
  counts: {
    programs: number
    blocks: number
    questions: number
    teams: number
    projects: number
    judges: number
    evaluations: number
  }
  isEmpty: boolean
}

export function SeedManager() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState<any>(null)

  const {
    data: dbStatus,
    error,
    mutate,
    isLoading,
  } = useSWR<DatabaseStatus>("/api/seed", fetcher, {
    onError: (error) => {
      console.error("[v0] Seed Manager SWR Error:", error)
    },
    onSuccess: (data) => {
      console.log("[v0] Database status loaded:", data)
    },
  })

  const handleSeed = async () => {
    console.log("[v0] Starting database seeding...")
    setIsSeeding(true)
    setSeedResult(null)

    try {
      const response = await fetch("/api/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("[v0] Seed response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Seed failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      console.log("[v0] Seed result:", result)
      setSeedResult(result)
      mutate() // Refresh the status
    } catch (error) {
      console.error("[v0] Seed error:", error)
      setSeedResult({
        success: false,
        error: error.message,
      })
    } finally {
      setIsSeeding(false)
    }
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>
                <strong>Error al cargar el estado de la base de datos:</strong>
              </p>
              <p className="text-sm">{error.message}</p>
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

  if (isLoading || !dbStatus) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" />
          <p>Cargando estado de la base de datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600 text-base sm:text-lg">
            <Database className="w-4 h-4 sm:w-5 sm:h-5" />
            Estado de la Base de Datos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{dbStatus.counts.programs}</div>
              <div className="text-xs sm:text-sm text-slate-600">Programas</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{dbStatus.counts.blocks}</div>
              <div className="text-xs sm:text-sm text-slate-600">Bloques</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{dbStatus.counts.questions}</div>
              <div className="text-xs sm:text-sm text-slate-600">Preguntas</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{dbStatus.counts.teams}</div>
              <div className="text-xs sm:text-sm text-slate-600">Equipos</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{dbStatus.counts.projects}</div>
              <div className="text-xs sm:text-sm text-slate-600">Proyectos</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{dbStatus.counts.judges}</div>
              <div className="text-xs sm:text-sm text-slate-600">Jueces</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg col-span-2 sm:col-span-1">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{dbStatus.counts.evaluations}</div>
              <div className="text-xs sm:text-sm text-slate-600">Evaluaciones</div>
            </div>
          </div>

          {dbStatus.isEmpty && (
            <Alert className="mb-4 border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                La base de datos está vacía. Usa el botón de abajo para poblarla con datos de ejemplo.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              onClick={handleSeed}
              disabled={isSeeding}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white flex items-center justify-center gap-2"
              size="lg"
            >
              {isSeeding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {isSeeding ? "Poblando..." : "Poblar Base de Datos"}
            </Button>

            <Button
              onClick={() => mutate()}
              variant="outline"
              className="flex items-center justify-center gap-2 border-blue-300"
              size="lg"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar Estado
            </Button>
          </div>
        </CardContent>
      </Card>

      {seedResult && (
        <Card className={`border-blue-200 sm:border-green-200 ${seedResult.success ? "bg-green-50" : "bg-red-50"}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {seedResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              Resultado del Poblado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {seedResult.success ? (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-100">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm text-green-600">
                    ¡Base de datos poblada exitosamente!
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg sm:text-xl font-bold text-blue-600">{seedResult.summary.programs}</div>
                    <div className="text-xs sm:text-sm text-slate-600">Programas</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg sm:text-xl font-bold text-green-600">{seedResult.summary.blocks}</div>
                    <div className="text-xs sm:text-sm text-slate-600">Bloques</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg sm:text-xl font-bold text-blue-600">{seedResult.summary.questions}</div>
                    <div className="text-xs sm:text-sm text-slate-600">Preguntas</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg sm:text-xl font-bold text-green-600">{seedResult.summary.teams}</div>
                    <div className="text-xs sm:text-sm text-slate-600">Equipos</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg sm:text-xl font-bold text-blue-600">{seedResult.summary.projects}</div>
                    <div className="text-xs sm:text-sm text-slate-600">Proyectos</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg sm:text-xl font-bold text-green-600">{seedResult.summary.judges}</div>
                    <div className="text-xs sm:text-sm text-slate-600">Jueces</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg col-span-2 sm:col-span-1">
                    <div className="text-lg sm:text-xl font-bold text-blue-600">{seedResult.summary.evaluations}</div>
                    <div className="text-xs sm:text-sm text-slate-600">Evaluaciones</div>
                  </div>
                </div>
              </div>
            ) : (
              <Alert className="border-red-200 bg-red-100">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm text-red-600">Error: {seedResult.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-600 text-base sm:text-lg">Leyenda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 font-mono text-sm">
          <div>
            <h4 className="font-bold text-green-600 mb-2">PROGRAMAS:</h4>
            <ul className="space-y-1 text-slate-600">
              <li>• Programa de Aceleración</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-blue-600 mb-2">BLOQUES DE EVALUACIÓN:</h4>
            <ul className="space-y-1 text-slate-600">
              <li>• Innovación (3 preguntas)</li>
              <li>• Mercado (3 preguntas)</li>
              <li>• Equipo (3 preguntas)</li>
              <li>• Modelo de Negocio (3 preguntas)</li>
              <li>• Financiero (3 preguntas)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-red-600 mb-2">PROYECTOS DE EJEMPLO:</h4>
            <ul className="space-y-1 text-slate-600">
              <li>
                • <strong>Incubación:</strong> Cointable, Enhanced Altruism Protocol, Intezia, Aqua Click, Rial
              </li>
              <li>
                • <strong>Aceleración:</strong> Tu Ratings, Cercapp, Tickea, Conectados, WaLinz
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-green-600 mb-2">JUECES (21 TOTAL):</h4>
            <ul className="space-y-1 text-slate-600">
              <li>
                • <strong>Jurados nacionales (11):</strong> Ivan Bohorquez, Daniel Álvarez, Lorena Somoza, Alberto
                Ramos, Jorge García, Carlos Navarro, YANGO, Sophia Kossman, Juan González, Julia Delgado, Isaias Meza
              </li>
              <li>
                • <strong>Jurado BDV (6):</strong> Loyola Rosales, Alex Gómez, Luis Michel Jassir, Sandy Gómez, Antonio
                Guerra, Pedro Berroteran
              </li>
              <li>
                • <strong>Jurados internacionales (5):</strong> Iván Pérez, Eleonora Coppola, José Willington Ramírez,
                Alejandro Zotti, Angelo Zambrano
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
