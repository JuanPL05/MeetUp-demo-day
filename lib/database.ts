import { neon } from "@neondatabase/serverless"

// Connection pool management
class ConnectionPool {
  private activeConnections = 0
  private readonly maxConnections = 2 // Further reduced from 3 to 2 for better rate limiting
  private readonly requestQueue: Array<() => void> = []
  private readonly maxQueueSize = 15 // Increased queue size from 10 to 15
  private readonly minDelay = 1000 // Increased from 500ms to 1000ms minimum delay between requests
  private lastRequestTime = 0

  // Circuit breaker for rate limiting
  private circuitBreakerOpen = false
  private circuitBreakerTimeout: NodeJS.Timeout | null = null
  private consecutiveFailures = 0
  private readonly maxFailures = 2 // Reduced from 3 to 2 to trigger circuit breaker faster

  async acquireConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check circuit breaker
      if (this.circuitBreakerOpen) {
        reject(new Error("Circuit breaker is open - too many rate limit errors"))
        return
      }

      // Check queue size
      if (this.requestQueue.length >= this.maxQueueSize) {
        reject(new Error("Request queue is full - system overloaded"))
        return
      }

      if (this.activeConnections < this.maxConnections) {
        this.activeConnections++
        this.throttleRequest(resolve)
      } else {
        this.requestQueue.push(() => {
          this.activeConnections++
          this.throttleRequest(resolve)
        })
      }
    })
  }

  private throttleRequest(resolve: () => void): void {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    if (timeSinceLastRequest < this.minDelay) {
      const delay = this.minDelay - timeSinceLastRequest
      setTimeout(() => {
        this.lastRequestTime = Date.now()
        resolve()
      }, delay)
    } else {
      this.lastRequestTime = now
      resolve()
    }
  }

  releaseConnection(): void {
    this.activeConnections--
    if (this.requestQueue.length > 0) {
      const next = this.requestQueue.shift()
      if (next) next()
    }
  }

  reportSuccess(): void {
    this.consecutiveFailures = 0
    if (this.circuitBreakerOpen) {
      console.log("[v0] Circuit breaker closed - resuming normal operations")
      this.circuitBreakerOpen = false
      if (this.circuitBreakerTimeout) {
        clearTimeout(this.circuitBreakerTimeout)
        this.circuitBreakerTimeout = null
      }
    }
  }

  reportFailure(): void {
    this.consecutiveFailures++
    if (this.consecutiveFailures >= this.maxFailures && !this.circuitBreakerOpen) {
      console.log("[v0] Circuit breaker opened - pausing requests for 45 seconds")
      this.circuitBreakerOpen = true
      this.circuitBreakerTimeout = setTimeout(() => {
        console.log("[v0] Circuit breaker half-open - testing connection")
        this.circuitBreakerOpen = false
        this.consecutiveFailures = 0
      }, 45000)
    }
  }
}

const connectionPool = new ConnectionPool()

const sql = neon(process.env.DATABASE_URL!, {
  fetchConnectionCache: true,
})

export interface SystemHealth {
  database: boolean
  tables: boolean
  data: boolean
  error?: string
}

export async function executeQuery(query: string, params: any[] = []): Promise<any[]> {
  const maxRetries = 2 // Reduced from 3 to 2 retries to avoid overwhelming the system
  let lastError: any

  try {
    await connectionPool.acquireConnection()
  } catch (error: any) {
    console.error("[v0] Failed to acquire connection:", error.message)
    throw new Error("Database connection unavailable - system overloaded")
  }

  try {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[v0] Executing query (attempt ${attempt}):`, query.substring(0, 100) + "...")

        let result: any
        if (params.length > 0) {
          result = await sql.query(query, params)
        } else {
          result = await sql.query(query, [])
        }

        connectionPool.reportSuccess()
        return Array.isArray(result) ? result : [result]
      } catch (error: any) {
        lastError = error
        console.error(`[v0] Query execution failed (attempt ${attempt}):`, {
          query: query.substring(0, 100) + "...",
          params,
          error: error.message,
        })

        const errorMessage = error.message?.toLowerCase() || ""

        const isRateLimitError =
          errorMessage.includes("too many") ||
          errorMessage.includes("rate limit") ||
          errorMessage.includes("unexpected token") ||
          errorMessage.includes("invalid json") ||
          errorMessage.includes("too many r") ||
          errorMessage.includes("429")

        const isConnectionError =
          errorMessage.includes("failed to fetch") ||
          errorMessage.includes("connection") ||
          errorMessage.includes("timeout") ||
          error.code === "ECONNRESET" ||
          error.code === "ETIMEDOUT"

        if (isRateLimitError) {
          connectionPool.reportFailure()
        }

        const shouldRetry = attempt < maxRetries && (isRateLimitError || isConnectionError)

        if (shouldRetry) {
          const baseDelay = isRateLimitError ? 15000 : 3000
          const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 60000)

          console.log(
            `[v0] ${isRateLimitError ? "Rate limit detected" : "Connection error"}, retrying in ${delay}ms...`,
          )
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        }

        throw error
      }
    }

    throw lastError
  } finally {
    connectionPool.releaseConnection()
  }
}

export function handleDatabaseError(error: any, context: string): { message: string; status: number } {
  console.error(`[v0] Database error in ${context}:`, {
    message: error.message,
    code: error.code,
    detail: error.detail,
    hint: error.hint,
  })

  // Handle specific database errors
  if (error.code === "23505") {
    return { message: "Duplicate entry - record already exists", status: 409 }
  }

  if (error.code === "23503") {
    return { message: "Referenced record not found", status: 400 }
  }

  if (error.code === "23514") {
    return { message: "Invalid data - constraint violation", status: 400 }
  }

  if (error.message?.includes("connection")) {
    return { message: "Database connection error", status: 503 }
  }

  if (error.message?.includes("timeout")) {
    return { message: "Database operation timed out", status: 504 }
  }

  // Generic error
  return { message: `Database error: ${error.message}`, status: 500 }
}

export async function checkSystemHealth(): Promise<SystemHealth> {
  try {
    // Test basic connection with retry
    await executeQuery("SELECT 1 as test")

    // Check if core tables exist
    const tables = await executeQuery(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('programs', 'teams', 'projects', 'judges', 'blocks', 'questions', 'evaluations')
    `)

    const hasAllTables = tables.length >= 7

    if (!hasAllTables) {
      return {
        database: true,
        tables: false,
        data: false,
        error: "Missing required tables",
      }
    }

    // Check if we have basic data
    const programCount = await executeQuery("SELECT COUNT(*) as count FROM programs")
    const hasData = programCount[0]?.count > 0

    return {
      database: true,
      tables: true,
      data: hasData,
    }
  } catch (error: any) {
    console.error("[v0] System health check failed:", error)
    return {
      database: false,
      tables: false,
      data: false,
      error: error.message,
    }
  }
}

export async function initializeDatabase(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[v0] Initializing database...")

    // Create tables with proper constraints
    await sql.query(`
      CREATE TABLE IF NOT EXISTS programs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    await sql.query(`
      CREATE TABLE IF NOT EXISTS blocks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        "order" INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    await sql.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        block_id TEXT NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
        "order" INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    await sql.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    await sql.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        program_id TEXT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
        team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    await sql.query(`
      CREATE TABLE IF NOT EXISTS judges (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        token TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    await sql.query(`
      CREATE TABLE IF NOT EXISTS evaluations (
        id SERIAL PRIMARY KEY,
        score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
        judge_id TEXT NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(judge_id, project_id, question_id)
      )
    `)

    console.log("[v0] Tables created successfully")

    // Insert basic data
    await sql.query(`
      INSERT INTO programs (id, name, description) VALUES 
      ('prog_incubation', 'Programa de Incubación', 'Programa para startups en etapa temprana'),
      ('prog_acceleration', 'Programa de Aceleración', 'Programa para startups en crecimiento')
      ON CONFLICT (id) DO NOTHING
    `)

    await sql.query(`
      INSERT INTO blocks (id, name, description, "order") VALUES 
      ('block_innovation', 'Innovación', 'Evaluación de la innovación del proyecto', 1),
      ('block_market', 'Mercado', 'Análisis del mercado y oportunidad', 2),
      ('block_team', 'Equipo', 'Evaluación del equipo fundador', 3),
      ('block_business', 'Modelo de Negocio', 'Viabilidad del modelo de negocio', 4),
      ('block_financial', 'Financiero', 'Proyecciones y viabilidad financiera', 5)
      ON CONFLICT (id) DO NOTHING
    `)

    await sql.query(`
      INSERT INTO questions (id, text, block_id, "order") VALUES 
      ('q_innovation_1', '¿Qué tan innovadora es la solución propuesta?', 'block_innovation', 1),
      ('q_innovation_2', '¿El proyecto resuelve un problema real y significativo?', 'block_innovation', 2),
      ('q_market_1', '¿Qué tan grande es el mercado objetivo?', 'block_market', 1),
      ('q_market_2', '¿El equipo comprende bien su mercado?', 'block_market', 2),
      ('q_team_1', '¿El equipo tiene las competencias necesarias?', 'block_team', 1),
      ('q_team_2', '¿Qué tan comprometido está el equipo?', 'block_team', 2),
      ('q_business_1', '¿El modelo de negocio es claro y viable?', 'block_business', 1),
      ('q_business_2', '¿Las fuentes de ingresos están bien definidas?', 'block_business', 2),
      ('q_financial_1', '¿Las proyecciones financieras son realistas?', 'block_financial', 1),
      ('q_financial_2', '¿El proyecto tiene potencial de escalabilidad?', 'block_financial', 2)
      ON CONFLICT (id) DO NOTHING
    `)

    await sql.query(`
      INSERT INTO teams (id, name, description) VALUES 
      ('team_techstars', 'TechStars', 'Startup de tecnología educativa'),
      ('team_greentech', 'GreenTech Solutions', 'Soluciones tecnológicas sostenibles'),
      ('team_healthai', 'HealthAI', 'Inteligencia artificial para salud')
      ON CONFLICT (id) DO NOTHING
    `)

    await sql.query(`
      INSERT INTO projects (id, name, description, program_id, team_id) VALUES 
      ('proj_edutech', 'EduTech Platform', 'Plataforma de aprendizaje personalizado con IA', 'prog_incubation', 'team_techstars'),
      ('proj_carbon', 'Carbon Tracker', 'Sistema de monitoreo de huella de carbono empresarial', 'prog_acceleration', 'team_greentech'),
      ('proj_diagnosis', 'AI Diagnosis', 'Diagnóstico médico asistido por inteligencia artificial', 'prog_incubation', 'team_healthai')
      ON CONFLICT (id) DO NOTHING
    `)

    await sql.query(`
      INSERT INTO judges (id, name, email, token) VALUES 
      ('judge_maria', 'María González', 'maria@judges.com', 'token_maria_123'),
      ('judge_carlos', 'Carlos Rodríguez', 'carlos@judges.com', 'token_carlos_456')
      ON CONFLICT (id) DO NOTHING
    `)

    console.log("[v0] Database initialized successfully")
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Database initialization failed:", error)
    return { success: false, error: error.message }
  }
}
