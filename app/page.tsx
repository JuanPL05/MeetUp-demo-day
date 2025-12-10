"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Settings, BarChart3, Zap } from "lucide-react"
import { useEffect } from "react"
import { SystemDiagnostics } from "@/components/system-diagnostics"

export default function HomePage() {
  useEffect(() => {
    console.log("[v0] HomePage loaded successfully")
  }, [])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black mb-4 retro-glow">MEETUP DEMO DAY</h1>
          <div className="flex items-center justify-center gap-2 mb-6">
            <Badge className="retro-border text-lg px-4 py-2">Banco Plaza</Badge>
            <Zap className="w-6 h-6 text-accent animate-pulse" />
          </div>
          <p className="text-xl text-muted-foreground font-mono max-w-2xl mx-auto">
            Sistema de evaluación para el MeetUp demo day.
          </p>
        </div>

        <div className="mb-8">
          <SystemDiagnostics />
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Link href="/admin">
            <Card className="cursor-pointer transition-all hover:scale-105 retro-border h-64 flex flex-col">
              <CardHeader className="text-center pb-2">
                <Settings className="w-10 h-10 mx-auto mb-2 text-primary" />
                <CardTitle className="text-xl retro-glow">ADMIN PANEL</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex flex-col flex-grow p-4">
                <p className="text-muted-foreground font-mono text-sm mb-3 flex-grow">
                  Gestiona programas, equipos, proyectos y jueces
                </p>
                <Button className="retro-button w-full">ACCEDER</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard">
            <Card className="cursor-pointer transition-all hover:scale-105 retro-border h-64 flex flex-col">
              <CardHeader className="text-center pb-2">
                <BarChart3 className="w-10 h-10 mx-auto mb-2 text-accent" />
                <CardTitle className="text-xl retro-glow">DASHBOARD</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex flex-col flex-grow p-4">
                <p className="text-muted-foreground font-mono text-sm mb-3 flex-grow">
                  Rankings y estadísticas en tiempo real
                </p>
                <Button className="retro-button w-full">VER RANKINGS</Button>
              </CardContent>
            </Card>
          </Link>

          <Card className="retro-border h-64 flex flex-col">
            <CardHeader className="text-center pb-2">
              <Trophy className="w-10 h-10 mx-auto mb-2 text-destructive" />
              <CardTitle className="text-xl retro-glow">EVALUACIÓN</CardTitle>
            </CardHeader>
            <CardContent className="text-center flex flex-col flex-grow p-4">
              <p className="text-muted-foreground font-mono text-sm mb-3 flex-grow">
                Los jueces acceden con su token único
              </p>
              <div className="text-sm text-white font-mono bg-slate-800 p-2 rounded border border-slate-600">
                URL: /judge/[token]
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="retro-border">
            <CardHeader>
              <CardTitle className="retro-glow">CARACTERÍSTICAS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 font-mono">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                <span>Evaluación en tiempo real</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span>Sistema de puntuación 1-5</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                <span>Rankings automáticos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                <span>Interfaz retro gaming</span>
              </div>
            </CardContent>
          </Card>

          <Card className="retro-border">
            <CardHeader>
              <CardTitle className="retro-glow">PROGRAMAS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-secondary rounded border border-accent/30">
                <h4 className="font-bold text-accent">INCUBACIÓN</h4>
                <p className="text-sm text-muted-foreground font-mono">Para startups en etapa temprana</p>
              </div>
              <div className="p-3 bg-secondary rounded border border-primary/30">
                <h4 className="font-bold text-primary">ACELERACIÓN</h4>
                <p className="text-sm text-muted-foreground font-mono">Para startups en crecimiento</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-border">
          <p className="text-muted-foreground font-mono text-sm">POWERED BY RETRO TECH • DOOM 64 AESTHETIC • v0.app</p>
        </div>
      </div>
    </div>
  )
}
