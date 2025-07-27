// import { NextRequest, NextResponse } from 'next/server'
// import { requireAuth, updateLastActive } from '@/lib/auth/utils'
// import { logger } from '@/lib/utils/logger'

// export async function POST(request: NextRequest) {
//   try {
//     const session = await requireAuth()
    
//     // Update last active timestamp
//     await updateLastActive(session.user.id)
    
//     // In a real implementation, you might refresh GitHub tokens here
//     // For now, we'll just return success
    
//     return NextResponse.json({
//       success: true,
//       timestamp: new Date().toISOString()
//     })
//   } catch (error) {
//     logger.error('Session refresh error', error as Error)
//     return NextResponse.json(
//       { error: 'Failed to refresh session' },
//       { status: 500 }
//     )
//   }
// }




// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from "next/server"
import { requireAuth, updateLastActive, validateAndRefreshTokens } from "@/lib/auth/better-utils"
import { logger } from "@/lib/utils/logger"

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    
    // Update last active timestamp
    await updateLastActive(session.user.id)
    
    // Validate and refresh GitHub tokens if needed
    const tokenValidation = await validateAndRefreshTokens(session.user.id)
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tokenValid: tokenValidation.isValid,
      tokenRefreshed: tokenValidation.refreshed,
    })
  } catch (error) {
    logger.error("Session refresh error", error as Error)
    return NextResponse.json(
      { error: "Failed to refresh session" },
      { status: 500 }
    )
  }
}
