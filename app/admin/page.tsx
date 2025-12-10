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
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-green-50/30 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            Panel de Administración
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Gestiona programas, equipos, proyectos, jueces y evaluaciones
          </p>
        </div>

        <Tabs defaultValue="seed" className="space-y-4 sm:space-y-6">
          <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1 sm:gap-2 h-auto p-1">
            <TabsTrigger value="seed" className="text-xs sm:text-sm py-2">
              Datos
            </TabsTrigger>
            <TabsTrigger value="programs" className="text-xs sm:text-sm py-2">
              Programas
            </TabsTrigger>
            <TabsTrigger value="blocks" className="text-xs sm:text-sm py-2">
              Bloques
            </TabsTrigger>
            <TabsTrigger value="questions" className="text-xs sm:text-sm py-2">
              Preguntas
            </TabsTrigger>
            <TabsTrigger value="teams" className="text-xs sm:text-sm py-2">
              Área
            </TabsTrigger>
            <TabsTrigger value="projects" className="text-xs sm:text-sm py-2">
              Equipos
            </TabsTrigger>
            <TabsTrigger value="judges" className="text-xs sm:text-sm py-2">
              Jueces
            </TabsTrigger>
          </TabsList>

          <TabsContent value="seed">
            <Card className="border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl text-blue-600">Gestión de Datos</CardTitle>
                <CardDescription className="text-sm">Poblar la base de datos con datos de ejemplo</CardDescription>
              </CardHeader>
              <CardContent>
                <SeedManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programs">
            <Card className="border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl text-blue-600">Gestión de Programas</CardTitle>
                <CardDescription className="text-sm">
                  Administra los programas de incubación y aceleración
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProgramsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blocks">
            <Card className="border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl text-blue-600">Gestión de bloques de preguntas</CardTitle>
                <CardDescription className="text-sm">Organiza las categorías de evaluación</CardDescription>
              </CardHeader>
              <CardContent>
                <BlocksManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions">
            <Card className="border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl text-blue-600">Gestión de Preguntas</CardTitle>
                <CardDescription className="text-sm">Define las preguntas de evaluación por bloque</CardDescription>
              </CardHeader>
              <CardContent>
                <QuestionsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams">
            <Card className="border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl text-blue-600">Gestión de áreas</CardTitle>
                <CardDescription className="text-sm">Administra las áreas de los equipos participantes</CardDescription>
              </CardHeader>
              <CardContent>
                <TeamsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card className="border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl text-blue-600">Gestión de Proyectos</CardTitle>
                <CardDescription className="text-sm">Administra los proyectos de cada equipo</CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="judges">
            <Card className="border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl text-blue-600">Gestión de Jueces</CardTitle>
                <CardDescription className="text-sm">Administra los jueces evaluadores</CardDescription>
              </CardHeader>
              <CardContent>
                <JudgesManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-200">
          <p className="text-xs sm:text-sm text-slate-600">
            Desarrollado por <span className="text-blue-600 font-bold">CONCEPTUAL DYNAMIC</span> • Soluciones
            Tecnológicas Innovadoras
          </p>
        </div>
      </div>
    </div>
  )
}
