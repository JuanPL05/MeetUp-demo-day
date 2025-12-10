"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProgramsManager } from "@/components/admin/programs-manager"
import { BlocksManager } from "@/components/admin/blocks-manager"
import { QuestionsManager } from "@/components/admin/questions-manager"
import { TeamsManager } from "@/components/admin/teams-manager"
import { ProjectsManager } from "@/components/admin/projects-manager"
import { JudgesManager } from "@/components/admin/judges-manager"
import { SeedManager } from "@/components/admin/seed-manager"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 retro-glow">PANEL DE ADMINISTRACIÓN</h1>
          <p className="text-muted-foreground font-mono">
            Gestiona programas, equipos, proyectos, jueces y evaluaciones
          </p>
        </div>

        <Tabs defaultValue="seed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 gap-2">
            <TabsTrigger value="seed" className="text-sm">Datos</TabsTrigger>
            <TabsTrigger value="programs" className="text-sm">Programas</TabsTrigger>
            <TabsTrigger value="blocks" className="text-sm">Bloques</TabsTrigger>
            <TabsTrigger value="questions" className="text-sm">Preguntas</TabsTrigger>
            <TabsTrigger value="teams" className="text-sm">Área</TabsTrigger>
            <TabsTrigger value="projects" className="text-sm">Equipos participantes</TabsTrigger>
            <TabsTrigger value="judges" className="text-sm">Jueces</TabsTrigger>
          </TabsList>

          <TabsContent value="seed">
            <Card className="retro-border">
              <CardHeader>
                <CardTitle className="retro-glow">Gestión de Datos</CardTitle>
                <CardDescription className="font-mono">Poblar la base de datos con datos de ejemplo</CardDescription>
              </CardHeader>
              <CardContent>
                <SeedManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programs">
            <Card className="retro-border">
              <CardHeader>
                <CardTitle className="retro-glow">Gestión de Programas</CardTitle>
                <CardDescription className="font-mono">
                  Administra los programas de incubación y aceleración
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProgramsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blocks">
            <Card className="retro-border">
              <CardHeader>
                <CardTitle className="retro-glow">Gestión de bloques de preguntas</CardTitle>
                <CardDescription className="font-mono">Organiza las categorías de evaluación</CardDescription>
              </CardHeader>
              <CardContent>
                <BlocksManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <Card className="retro-border">
              <CardHeader>
                <CardTitle className="retro-glow">Gestión de Preguntas</CardTitle>
                <CardDescription className="font-mono">Define las preguntas de evaluación por bloque</CardDescription>
              </CardHeader>
              <CardContent>
                <QuestionsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams">
            <Card className="retro-border">
              <CardHeader>
                <CardTitle className="retro-glow">Gestión de áreas</CardTitle>
                <CardDescription className="font-mono">Administra las áreas de los equipos participantes</CardDescription>
              </CardHeader>
              <CardContent>
                <TeamsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card className="retro-border">
              <CardHeader>
                <CardTitle className="retro-glow">Gestión de Proyectos</CardTitle>
                <CardDescription className="font-mono">Administra los proyectos de cada equipo</CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="judges">
            <Card className="retro-border">
              <CardHeader>
                <CardTitle className="retro-glow">Gestión de Jueces</CardTitle>
                <CardDescription className="font-mono">Administra los jueces evaluadores</CardDescription>
              </CardHeader>
              <CardContent>
                <JudgesManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-border">
          <p className="text-muted-foreground font-mono text-sm">
            DESARROLLADO POR{" "}
            <span className="text-primary font-bold retro-glow">CONCEPTUAL DYNAMIC</span>
            {" "}• SOLUCIONES TECNOLÓGICAS INNOVADORAS
          </p>
        </div>
      </div>
    </div>
  )
}
