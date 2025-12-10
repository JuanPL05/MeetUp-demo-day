"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Database, CheckCircle } from "lucide-react"

export default function SchemaUpdater() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateResult, setUpdateResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleUpdateSchema = async () => {
    setIsUpdating(true)
    setUpdateResult(null)

    try {
      const response = await fetch("/api/update-schema", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()
      setUpdateResult(result)

      if (result.success) {
        // Refresh the page after successful update
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch (error) {
      setUpdateResult({
        success: false,
        message: error instanceof Error ? error.message : "Error desconocido",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className="retro-border bg-slate-900/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-400 font-mono uppercase tracking-wider">
          <Database className="h-5 w-5" />
          Actualizar Esquema de Base de Datos
        </CardTitle>
        <CardDescription className="text-slate-300">
          Agrega las columnas faltantes y actualiza el rango de puntuación a 0.2 - 1.2.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded">
          <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-orange-200">
            <p className="font-medium mb-1">Actualización necesaria</p>
            <p>
              Actualiza el constraint de puntuación para permitir el rango 0.2 - 1.2 y agrega columnas faltantes.
            </p>
          </div>
        </div>

        {updateResult && (
          <div
            className={`flex items-start gap-3 p-3 border rounded ${
              updateResult.success ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"
            }`}
          >
            <CheckCircle
              className={`h-5 w-5 mt-0.5 flex-shrink-0 ${updateResult.success ? "text-green-400" : "text-red-400"}`}
            />
            <div className="text-sm">
              <p className={updateResult.success ? "text-green-200" : "text-red-200"}>{updateResult.message}</p>
              {updateResult.success && <p className="text-green-300 mt-1">La página se recargará automáticamente...</p>}
            </div>
          </div>
        )}

        <Button
          onClick={handleUpdateSchema}
          disabled={isUpdating}
          className="w-full bg-green-600 hover:bg-green-700 text-black font-mono uppercase tracking-wider retro-glow"
        >
          {isUpdating ? "ACTUALIZANDO ESQUEMA..." : "ACTUALIZAR ESQUEMA DE BD"}
        </Button>
      </CardContent>
    </Card>
  )
}
