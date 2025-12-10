import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log("[v0] Database connection successful")
    return true
  } catch (error) {
    console.error("[v0] Database connection failed:", error)
    return false
  }
}

export async function handleDatabaseOperation<T>(
  operation: () => Promise<T>,
  errorMessage = "Database operation failed",
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await operation()
    return { data }
  } catch (error: any) {
    console.error(`[v0] ${errorMessage}:`, error)

    // Handle specific Prisma errors
    if (error.code === "P2002") {
      return { error: "A record with this data already exists" }
    }
    if (error.code === "P2025") {
      return { error: "Record not found" }
    }
    if (error.code === "P1001") {
      return { error: "Cannot reach database server" }
    }
    if (error.code === "P1008") {
      return { error: "Operations timed out" }
    }

    return { error: errorMessage }
  }
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
