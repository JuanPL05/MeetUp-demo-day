import { type NextRequest, NextResponse } from "next/server"
import { executeQuery, handleDatabaseError } from "@/lib/database"

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token

    // Check if token starts with DISABLED_ prefix
    if (token.startsWith('DISABLED_')) {
      return NextResponse.json(
        { message: "La evaluación ha sido cerrada por el administrador", isDisabled: true },
        { status: 403 }
      )
    }

    // Query the database for the judge with this token OR with DISABLED_ prefix
    const result = await executeQuery(
      'SELECT id, name, email, token FROM judges WHERE token = $1 OR token = $2',
      [token, `DISABLED_${token}`]
    )

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Token inválido o no encontrado" },
        { status: 404 }
      )
    }

    const judge = result[0]

    // If the database token starts with DISABLED_, reject access
    if (judge.token.startsWith('DISABLED_')) {
      return NextResponse.json(
        { message: "La evaluación ha sido cerrada por el administrador", isDisabled: true },
        { status: 403 }
      )
    }

    return NextResponse.json({
      id: judge.id,
      name: judge.name,
      email: judge.email,
      token: judge.token
    })

  } catch (error) {
    console.error('[API] Error validating judge token:', error)
    const { message, status } = handleDatabaseError(error, 'validate judge token')
    return NextResponse.json({ message }, { status })
  }
}
