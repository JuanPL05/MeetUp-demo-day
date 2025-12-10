"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, RefreshCw, Database, AlertTriangle } from "lucide-react"

interface SystemHealth {
  database: boolean
  tables: boolean
  data: boolean
  error?: string
}

export function SystemDiagnostics() {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)

  const checkHealth = async () => {
    setIsLoading(true)
    console.log("[v0] Checking system health...")

    try {
      const response = await fetch("/api/system/health")
      if (response.ok) {
        const data = await response.json()
        setHealth(data.health)
        console.log("[v0] Health check completed:", data.health)
      } else {
        setHealth({
          database: false,
          tables: false,
          data: false,
          error: "Health check failed",
        })
      }
    } catch (error) {
      console.error("[v0] Health check error:", error)
      setHealth({
        database: false,
        tables: false,
        data: false,
        error: "Connection failed",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const initializeSystem = async () => {
    setIsInitializing(true)
    console.log("[v0] Initializing system...")

    try {
      const response = await fetch("/api/system/init", { method: "POST" })
      const data = await response.json()

      if (data.success) {
        console.log("[v0] System initialized successfully")
        await checkHealth()
      } else {
        console.error("[v0] Initialization failed:", data.error)
      }
    } catch (error) {
      console.error("[v0] Initialization error:", error)
    } finally {
      setIsInitializing(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  const getStatusIcon = (status: boolean, isError?: boolean) => {
    if (isError) return <XCircle className="w-5 h-5 text-red-500" />
    if (status) return <CheckCircle className="w-5 h-5 text-green-500" />
    return <AlertTriangle className="w-5 h-5 text-yellow-500" />
  }

  const getStatusText = (key: string, status: boolean) => {
    const texts = {
      database: status ? "Conexión establecida" : "Sin conexión",
      tables: status ? "Tablas creadas" : "Tablas faltantes",
      data: status ? "Datos inicializados" : "Sin datos",
    }
    return texts[key as keyof typeof texts] || "Desconocido"
  }

  const allSystemsWorking = health?.database && health?.tables && health?.data
  const needsInitialization = health?.database && !health?.tables

  return (
    <Card className="retro-border">
      <CardHeader>
        <CardTitle className="retro-glow flex items-center gap-2">
          <Database className="w-6 h-6" />
          DIAGNÓSTICO DEL SISTEMA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {health && (
          <div className="space-y-3">
            {Object.entries({
              database: health.database,
              tables: health.tables,
              data: health.data,
            }).map(([key, status]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-secondary rounded">
                <div className="flex items-center gap-3">
                  {getStatusIcon(status, !!health.error)}
                  <span className="font-mono">{getStatusText(key, status)}</span>
                </div>
                <Badge variant={status ? "default" : "destructive"}>{status ? "OK" : "ERROR"}</Badge>
              </div>
            ))}
          </div>
        )}

        {health?.error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded">
            <p className="text-red-500 text-sm font-mono">{health.error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-border">
          <Button onClick={checkHealth} variant="outline" className="flex-1 bg-transparent" disabled={isLoading}>
            {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Verificar Estado
          </Button>

          {(needsInitialization || !health?.data) && (
            <Button onClick={initializeSystem} className="flex-1 retro-button" disabled={isInitializing}>
              {isInitializing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              {isInitializing ? "Inicializando..." : "Inicializar Sistema"}
            </Button>
          )}
        </div>

        {allSystemsWorking && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-green-500 font-mono font-bold">¡SISTEMA OPERATIVO!</p>
            <p className="text-sm text-muted-foreground">Todos los componentes funcionan correctamente</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
