// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession, getServerUser } from "@/lib/auth/better-utils"
import { logger } from "@/lib/utils/logger"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ session: null }, { status: 200 })
    }

    // Get enhanced user data
    const user = await getServerUser()
    
    return NextResponse.json({
      session: {
        ...session,
        user
      }
    })
  } catch (error) {
    logger.error("Session API error", error as Error)
    return NextResponse.json(
      { error: "Failed to get session" },
      { status: 500 }
    )
  }
}
