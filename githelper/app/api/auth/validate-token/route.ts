
// app/api/auth/validate-token/route.ts
import { NextRequest, NextResponse } from "next/server"
import { requireAuth, validateAndRefreshTokens } from "@/lib/auth/better-utils"
import { logger } from "@/lib/utils/logger"

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const tokenValidation = await validateAndRefreshTokens(session.user.id)
    
    return NextResponse.json({
      success: true,
      validation: tokenValidation,
    })
  } catch (error) {
    logger.error("Token validation error", error as Error)
    return NextResponse.json(
      { error: "Failed to validate token" },
      { status: 500 }
    )
  }
}