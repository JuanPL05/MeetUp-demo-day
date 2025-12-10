import { NextResponse } from "next/server"
import { checkSystemHealth } from "@/lib/database"

export async function GET() {
  try {
    const health = await checkSystemHealth()

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      health,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 500 },
    )
  }
}
