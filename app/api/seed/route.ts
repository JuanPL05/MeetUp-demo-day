import { NextResponse } from "next/server"
import { executeQuery, handleDatabaseError } from "@/lib/database"

export async function POST() {
  try {
    console.log("[v0] Starting database seeding process...")

    // Step 0: Updating database schema...
    console.log("[v0] Step 0: Updating database schema...")

    // Add category column to judges if it doesn't exist
    try {
      await executeQuery(`
        ALTER TABLE judges ADD COLUMN IF NOT EXISTS category VARCHAR(255) DEFAULT 'Jurados nacionales'
      `)
      console.log("[v0] Added category column to judges")
    } catch (error) {
      console.log("[v0] Category column already exists or error:", error.message)
    }

    // Add programId column to blocks if it doesn't exist
    try {
      await executeQuery(`
        ALTER TABLE blocks ADD COLUMN IF NOT EXISTS "programId" VARCHAR(255)
      `)
      console.log("[v0] Added programId column to blocks")
    } catch (error) {
      console.log("[v0] ProgramId column already exists in blocks or error:", error.message)
    }

    // Add programId, description, and score columns to questions if they don't exist
    try {
      await executeQuery(`
        ALTER TABLE questions ADD COLUMN IF NOT EXISTS "programId" VARCHAR(255)
      `)
      console.log("[v0] Added programId column to questions")
    } catch (error) {
      console.log("[v0] ProgramId column already exists in questions or error:", error.message)
    }

    try {
      await executeQuery(`
        ALTER TABLE questions ADD COLUMN IF NOT EXISTS description TEXT
      `)
      console.log("[v0] Added description column to questions")
    } catch (error) {
      console.log("[v0] Description column already exists in questions or error:", error.message)
    }

    try {
      await executeQuery(`
        ALTER TABLE questions ADD COLUMN IF NOT EXISTS score DECIMAL(3,2) DEFAULT 0.5
      `)
      console.log("[v0] Added score column to questions")
    } catch (error) {
      console.log("[v0] Score column already exists in questions or error:", error.message)
    }

    console.log("[v0] Step 1: Clearing existing data...")
    await executeQuery("DELETE FROM evaluations")
    console.log("[v0] Cleared evaluations")

    await executeQuery("DELETE FROM questions")
    console.log("[v0] Cleared questions")

    await executeQuery("DELETE FROM projects")
    console.log("[v0] Cleared projects")

    await executeQuery("DELETE FROM judges")
    console.log("[v0] Cleared judges")

    await executeQuery("DELETE FROM blocks")
    console.log("[v0] Cleared blocks")

    await executeQuery("DELETE FROM teams")
    console.log("[v0] Cleared teams")

    await executeQuery("DELETE FROM programs")
    console.log("[v0] Cleared programs")

    console.log("[v0] Step 2: Creating programs...")
    await executeQuery(`
      INSERT INTO programs (id, name, description, "createdAt", "updatedAt") VALUES
      ('prog_incubacion', 'Programa de Incubación', 'Programa para startups en etapa temprana', NOW(), NOW()),
      ('prog_aceleracion', 'Programa de Aceleración', 'Programa para startups en crecimiento', NOW(), NOW())
    `)
    console.log("[v0] Created programs: 2")

    console.log("[v0] Step 3: Creating teams...")
    await executeQuery(`
      INSERT INTO teams (id, name, description, "createdAt", "updatedAt") VALUES
      ('team_cointable', 'Cointable', 'Equipo de Cointable', NOW(), NOW()),
      ('team_enhanced_altruism', 'Enhanced Altruism Protocol', 'Equipo de Enhanced Altruism Protocol', NOW(), NOW()),
      ('team_intezia', 'Intezia', 'Equipo de Intezia', NOW(), NOW()),
      ('team_aqua_click', 'Aqua Click', 'Equipo de Aqua Click', NOW(), NOW()),
      ('team_rial', 'Rial', 'Equipo de Rial', NOW(), NOW()),
      ('team_tu_ratings', 'Tu Ratings', 'Equipo de Tu Ratings', NOW(), NOW()),
      ('team_cercapp', 'Cercapp', 'Equipo de Cercapp', NOW(), NOW()),
      ('team_tickea', 'Tickea', 'Equipo de Tickea', NOW(), NOW()),
      ('team_conectados', 'Conectados', 'Equipo de Conectados', NOW(), NOW()),
      ('team_walinz', 'WaLinz', 'Equipo de WaLinz', NOW(), NOW())
    `)
    console.log("[v0] Created teams: 10")

    console.log("[v0] Step 4: Creating projects...")
    await executeQuery(`
      INSERT INTO projects (id, name, description, "programId", "teamId", "createdAt", "updatedAt") VALUES
      ('proj_cointable', 'Cointable', 'Proyecto Cointable', 'prog_incubacion', 'team_cointable', NOW(), NOW()),
      ('proj_enhanced_altruism', 'Enhanced Altruism Protocol', 'Proyecto Enhanced Altruism Protocol', 'prog_incubacion', 'team_enhanced_altruism', NOW(), NOW()),
      ('proj_intezia', 'Intezia', 'Proyecto Intezia', 'prog_incubacion', 'team_intezia', NOW(), NOW()),
      ('proj_aqua_click', 'Aqua Click', 'Proyecto Aqua Click', 'prog_incubacion', 'team_aqua_click', NOW(), NOW()),
      ('proj_rial', 'Rial', 'Proyecto Rial', 'prog_incubacion', 'team_rial', NOW(), NOW()),
      ('proj_tu_ratings', 'Tu Ratings', 'Proyecto Tu Ratings', 'prog_aceleracion', 'team_tu_ratings', NOW(), NOW()),
      ('proj_cercapp', 'Cercapp', 'Proyecto Cercapp', 'prog_aceleracion', 'team_cercapp', NOW(), NOW()),
      ('proj_tickea', 'Tickea', 'Proyecto Tickea', 'prog_aceleracion', 'team_tickea', NOW(), NOW()),
      ('proj_conectados', 'Conectados', 'Proyecto Conectados', 'prog_aceleracion', 'team_conectados', NOW(), NOW()),
      ('proj_walinz', 'WaLinz', 'Proyecto WaLinz', 'prog_aceleracion', 'team_walinz', NOW(), NOW())
    `)
    console.log("[v0] Created projects: 10")

    console.log("[v0] Step 5: Creating judges...")
    await executeQuery(`
      INSERT INTO judges (id, name, email, token, category, "createdAt", "updatedAt") VALUES
      -- Jurados nacionales
      ('judge_ivan_bohorquez', 'Ivan Bohorquez', 'ivan.bohorquez@judges.com', 'IvanBohorquez', 'Jurados nacionales', NOW(), NOW()),
      ('judge_daniel_alvarez', 'Daniel Álvarez', 'daniel.alvarez@judges.com', 'DanielAlvarez', 'Jurados nacionales', NOW(), NOW()),
      ('judge_lorena_somoza', 'Lorena Somoza', 'lorena.somoza@judges.com', 'LorenaSomoza', 'Jurados nacionales', NOW(), NOW()),
      ('judge_alberto_ramos', 'Alberto Ramos', 'alberto.ramos@judges.com', 'AlbertoRamos', 'Jurados nacionales', NOW(), NOW()),
      ('judge_jorge_garcia', 'Jorge García', 'jorge.garcia@judges.com', 'JorgeGarcia', 'Jurados nacionales', NOW(), NOW()),
      ('judge_carlos_navarro', 'Carlos Navarro', 'carlos.navarro@judges.com', 'CarlosNavarro', 'Jurados nacionales', NOW(), NOW()),
      ('judge_yango', 'YANGO', 'yango@judges.com', 'YANGO', 'Jurados nacionales', NOW(), NOW()),
      ('judge_sophia_kossman', 'Sophia Kossman', 'sophia.kossman@judges.com', 'SophiaKossman', 'Jurados nacionales', NOW(), NOW()),
      ('judge_juan_gonzalez', 'Juan González', 'juan.gonzalez@judges.com', 'JuanGonzalez', 'Jurados nacionales', NOW(), NOW()),
      ('judge_julia_delgado', 'Julia Delgado', 'julia.delgado@judges.com', 'JuliaDelgado', 'Jurados nacionales', NOW(), NOW()),
      ('judge_isaias_meza', 'Isaias Meza', 'isaias.meza@judges.com', 'IsaiasMeza', 'Jurados nacionales', NOW(), NOW()),
      -- Jurado BDV
      ('judge_loyola_rosales', 'Loyola Rosales (CME Marketing)', 'loyola.rosales@judges.com', 'LoyolaRosales', 'Jurado BDV', NOW(), NOW()),
      ('judge_alex_gomez', 'Alex Gómez (Innoven)', 'alex.gomez@judges.com', 'AlexGomez', 'Jurado BDV', NOW(), NOW()),
      ('judge_luis_jassir', 'Luis Michel Jassir (Square One Capital)', 'luis.jassir@judges.com', 'LuisMichelJassir', 'Jurado BDV', NOW(), NOW()),
      ('judge_sandy_gomez', 'Sandy Gómez (Arca Análisis)', 'sandy.gomez@judges.com', 'SandyGomez', 'Jurado BDV', NOW(), NOW()),
      ('judge_antonio_guerra', 'Antonio Guerra (Enlaparada)', 'antonio.guerra@judges.com', 'AntonioGuerra', 'Jurado BDV', NOW(), NOW()),
      ('judge_pedro_berroteran', 'Pedro Berroteran (LEGA Abogados)', 'pedro.berroteran@judges.com', 'PedroBerroteran', 'Jurado BDV', NOW(), NOW()),
      -- Jurados internacionales
      ('judge_ivan_perez', 'Iván Perez', 'ivan.perez@judges.com', 'IvanPerez', 'Jurados internacionales', NOW(), NOW()),
      ('judge_eleonora_coppola', 'Eleonora Coppola', 'eleonora.coppola@judges.com', 'EleonoraCoppola', 'Jurados internacionales', NOW(), NOW()),
      ('judge_jose_ramirez', 'José Willington Ramírez', 'jose.ramirez@judges.com', 'JoseWillingtonRamirez', 'Jurados internacionales', NOW(), NOW()),
      ('judge_alejandro_zotti', 'Alejandro Zotti', 'alejandro.zotti@judges.com', 'AlejandroZotti', 'Jurados internacionales', NOW(), NOW()),
      ('judge_angelo_zambrano', 'Angelo Zambrano', 'angelo.zambrano@judges.com', 'AngeloZambrano', 'Jurados internacionales', NOW(), NOW())
    `)
    console.log("[v0] Created judges: 21")

    console.log("[v0] Step 6: Creating blocks...")
    await executeQuery(`
      INSERT INTO blocks (id, name, description, "order", "programId", "createdAt", "updatedAt") VALUES
      -- Incubación blocks
      ('block_inc_innovacion', 'Innovación', 'Evaluación de la innovación del proyecto', 1, 'prog_incubacion', NOW(), NOW()),
      ('block_inc_mercado', 'Mercado', 'Análisis del mercado y oportunidad', 2, 'prog_incubacion', NOW(), NOW()),
      ('block_inc_equipo', 'Equipo', 'Evaluación del equipo fundador', 3, 'prog_incubacion', NOW(), NOW()),
      ('block_inc_modelo', 'Modelo de Negocio', 'Viabilidad del modelo de negocio', 4, 'prog_incubacion', NOW(), NOW()),
      ('block_inc_financiero', 'Financiero', 'Proyecciones y viabilidad financiera', 5, 'prog_incubacion', NOW(), NOW()),
      -- Aceleración blocks
      ('block_acc_innovacion', 'Innovación', 'Evaluación de la innovación del proyecto', 1, 'prog_aceleracion', NOW(), NOW()),
      ('block_acc_mercado', 'Mercado', 'Análisis del mercado y oportunidad', 2, 'prog_aceleracion', NOW(), NOW()),
      ('block_acc_equipo', 'Equipo', 'Evaluación del equipo fundador', 3, 'prog_aceleracion', NOW(), NOW()),
      ('block_acc_modelo', 'Modelo de Negocio', 'Viabilidad del modelo de negocio', 4, 'prog_aceleracion', NOW(), NOW()),
      ('block_acc_financiero', 'Financiero', 'Proyecciones y viabilidad financiera', 5, 'prog_aceleracion', NOW(), NOW())
    `)
    console.log("[v0] Created blocks: 10")

    console.log("[v0] Step 7: Creating questions...")
    await executeQuery(`
      INSERT INTO questions (id, text, description, score, "blockId", "programId", "order", "createdAt", "updatedAt") VALUES
      -- Incubación - Innovación (Total: ~2.0 puntos)
      ('q_inc_inn_1', '¿Qué tan innovadora es la solución propuesta?', 'Evaluar el nivel de innovación y diferenciación de la propuesta', 0.7, 'block_inc_innovacion', 'prog_incubacion', 1, NOW(), NOW()),
      ('q_inc_inn_2', '¿El proyecto resuelve un problema real y significativo?', 'Verificar que aborde una necesidad genuina del mercado', 0.8, 'block_inc_innovacion', 'prog_incubacion', 2, NOW(), NOW()),
      ('q_inc_inn_3', '¿Qué tan diferenciada es la propuesta de valor?', 'Analizar la diferenciación competitiva', 0.5, 'block_inc_innovacion', 'prog_incubacion', 3, NOW(), NOW()),
      -- Incubación - Mercado (Total: ~2.0 puntos)
      ('q_inc_mer_1', '¿Qué tan grande es el mercado objetivo?', 'Evaluar el tamaño y potencial del mercado', 0.6, 'block_inc_mercado', 'prog_incubacion', 1, NOW(), NOW()),
      ('q_inc_mer_2', '¿El equipo comprende bien su mercado?', 'Verificar el conocimiento del mercado objetivo', 0.7, 'block_inc_mercado', 'prog_incubacion', 2, NOW(), NOW()),
      ('q_inc_mer_3', '¿Existe tracción o validación del mercado?', 'Evaluar evidencia de demanda del mercado', 0.7, 'block_inc_mercado', 'prog_incubacion', 3, NOW(), NOW()),
      -- Incubación - Equipo (Total: ~2.0 puntos)
      ('q_inc_equ_1', '¿El equipo tiene las competencias necesarias?', 'Evaluar habilidades técnicas y de negocio', 0.8, 'block_inc_equipo', 'prog_incubacion', 1, NOW(), NOW()),
      ('q_inc_equ_2', '¿Qué tan comprometido está el equipo?', 'Verificar dedicación y compromiso del equipo', 0.6, 'block_inc_equipo', 'prog_incubacion', 2, NOW(), NOW()),
      ('q_inc_equ_3', '¿El equipo tiene experiencia relevante?', 'Analizar experiencia previa en el sector', 0.6, 'block_inc_equipo', 'prog_incubacion', 3, NOW(), NOW()),
      -- Incubación - Modelo de Negocio (Total: ~2.0 puntos)
      ('q_inc_mod_1', '¿El modelo de negocio es claro y viable?', 'Evaluar claridad y viabilidad del modelo', 0.7, 'block_inc_modelo', 'prog_incubacion', 1, NOW(), NOW()),
      ('q_inc_mod_2', '¿Las fuentes de ingresos están bien definidas?', 'Verificar claridad en monetización', 0.6, 'block_inc_modelo', 'prog_incubacion', 2, NOW(), NOW()),
      ('q_inc_mod_3', '¿La estrategia de go-to-market es sólida?', 'Analizar plan de llegada al mercado', 0.7, 'block_inc_modelo', 'prog_incubacion', 3, NOW(), NOW()),
      -- Incubación - Financiero (Total: ~2.0 puntos)
      ('q_inc_fin_1', '¿Las proyecciones financieras son realistas?', 'Evaluar realismo de proyecciones', 0.6, 'block_inc_financiero', 'prog_incubacion', 1, NOW(), NOW()),
      ('q_inc_fin_2', '¿El proyecto tiene potencial de escalabilidad?', 'Verificar capacidad de crecimiento', 0.8, 'block_inc_financiero', 'prog_incubacion', 2, NOW(), NOW()),
      ('q_inc_fin_3', '¿Los requerimientos de inversión son apropiados?', 'Analizar necesidades de financiamiento', 0.6, 'block_inc_financiero', 'prog_incubacion', 3, NOW(), NOW()),
      -- Aceleración - Innovación (Total: ~2.0 puntos)
      ('q_acc_inn_1', '¿La innovación es escalable y sostenible?', 'Evaluar capacidad de escalar la innovación', 0.8, 'block_acc_innovacion', 'prog_aceleracion', 1, NOW(), NOW()),
      ('q_acc_inn_2', '¿Existe protección intelectual de la innovación?', 'Verificar protección de propiedad intelectual', 0.5, 'block_acc_innovacion', 'prog_aceleracion', 2, NOW(), NOW()),
      ('q_acc_inn_3', '¿La tecnología está validada y probada?', 'Analizar madurez tecnológica', 0.7, 'block_acc_innovacion', 'prog_aceleracion', 3, NOW(), NOW()),
      -- Aceleración - Mercado (Total: ~2.0 puntos)
      ('q_acc_mer_1', '¿Existe tracción comprobada en el mercado?', 'Evaluar evidencia de tracción real', 0.8, 'block_acc_mercado', 'prog_aceleracion', 1, NOW(), NOW()),
      ('q_acc_mer_2', '¿El crecimiento del mercado es sostenible?', 'Verificar sostenibilidad del crecimiento', 0.7, 'block_acc_mercado', 'prog_aceleracion', 2, NOW(), NOW()),
      ('q_acc_mer_3', '¿La estrategia de expansión es clara?', 'Analizar plan de expansión de mercado', 0.5, 'block_acc_mercado', 'prog_aceleracion', 3, NOW(), NOW()),
      -- Aceleración - Equipo (Total: ~2.0 puntos)
      ('q_acc_equ_1', '¿El equipo puede ejecutar el plan de crecimiento?', 'Evaluar capacidad de ejecución', 0.8, 'block_acc_equipo', 'prog_aceleracion', 1, NOW(), NOW()),
      ('q_acc_equ_2', '¿Existe un plan de contratación estructurado?', 'Verificar estrategia de crecimiento del equipo', 0.5, 'block_acc_equipo', 'prog_aceleracion', 2, NOW(), NOW()),
      ('q_acc_equ_3', '¿El liderazgo es adecuado para la escala?', 'Analizar capacidad de liderazgo', 0.7, 'block_acc_equipo', 'prog_aceleracion', 3, NOW(), NOW()),
      -- Aceleración - Modelo de Negocio (Total: ~2.0 puntos)
      ('q_acc_mod_1', '¿El modelo genera ingresos recurrentes?', 'Evaluar recurrencia de ingresos', 0.8, 'block_acc_modelo', 'prog_aceleracion', 1, NOW(), NOW()),
      ('q_acc_mod_2', '¿Existen múltiples fuentes de ingresos?', 'Verificar diversificación de ingresos', 0.5, 'block_acc_modelo', 'prog_aceleracion', 2, NOW(), NOW()),
      ('q_acc_mod_3', '¿La unidad económica es rentable?', 'Analizar rentabilidad por unidad', 0.7, 'block_acc_modelo', 'prog_aceleracion', 3, NOW(), NOW()),
      -- Aceleración - Financiero (Total: ~2.0 puntos)
      ('q_acc_fin_1', '¿Existe un plan financiero detallado?', 'Evaluar detalle del plan financiero', 0.7, 'block_acc_financiero', 'prog_aceleracion', 1, NOW(), NOW()),
      ('q_acc_fin_2', '¿Los métricas clave están bien definidas?', 'Verificar claridad en KPIs financieros', 0.7, 'block_acc_financiero', 'prog_aceleracion', 2, NOW(), NOW()),
      ('q_acc_fin_3', '¿El retorno de inversión es atractivo?', 'Analizar atractivo para inversionistas', 0.6, 'block_acc_financiero', 'prog_aceleracion', 3, NOW(), NOW())
    `)
    console.log("[v0] Created questions: 30")

    const summary = {
      programs: 2,
      blocks: 10,
      questions: 30,
      teams: 10,
      projects: 10,
      judges: 21,
      evaluations: 0,
    }

    console.log("[v0] Database seeding completed successfully!")
    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with comprehensive new data",
      summary,
    })
  } catch (error) {
    console.error("[v0] Seeding error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })

    const { message, status } = handleDatabaseError(error, "Failed to seed database")
    return NextResponse.json(
      {
        success: false,
        error: message,
        details: error.message,
      },
      { status },
    )
  }
}

export async function GET() {
  try {
    const [programs, blocks, questions, teams, projects, judges, totalEvaluations, completedEvaluations] = await Promise.all([
      executeQuery("SELECT COUNT(*) as count FROM programs"),
      executeQuery("SELECT COUNT(*) as count FROM blocks"),
      executeQuery("SELECT COUNT(*) as count FROM questions"),
      executeQuery("SELECT COUNT(*) as count FROM teams"),
      executeQuery("SELECT COUNT(*) as count FROM projects"),
      executeQuery("SELECT COUNT(*) as count FROM judges"),
      executeQuery("SELECT COUNT(*) as count FROM evaluations"),
      executeQuery(`
        SELECT COUNT(DISTINCT 
          CASE 
            WHEN evaluations_count.total_evaluations = questions_count.total_questions 
            THEN evaluations_count.judge_project 
            ELSE NULL 
          END
        ) as count
        FROM (
          SELECT 
            CONCAT(e."judgeId", '-', e."projectId") as judge_project,
            COUNT(*) as total_evaluations
          FROM evaluations e
          GROUP BY e."judgeId", e."projectId"
        ) evaluations_count
        CROSS JOIN (
          SELECT COUNT(*) as total_questions FROM questions
        ) questions_count
      `),
    ])

    const counts = {
      programs: Number.parseInt(programs[0].count),
      blocks: Number.parseInt(blocks[0].count),
      questions: Number.parseInt(questions[0].count),
      teams: Number.parseInt(teams[0].count),
      projects: Number.parseInt(projects[0].count),
      judges: Number.parseInt(judges[0].count),
      evaluations: Number.parseInt(completedEvaluations[0].count),
    }

    return NextResponse.json({
      status: "Database Status",
      counts,
      isEmpty: Object.values(counts).every((count) => count === 0),
    })
  } catch (error) {
    console.error("[v0] Seed GET error:", error)
    const { message, status } = handleDatabaseError(error, "Failed to get database status")
    return NextResponse.json({ error: message }, { status })
  }
}
