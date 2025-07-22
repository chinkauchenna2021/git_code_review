import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, checkUsageLimits, getUserPermissions } from '@/lib/auth/utils'
import { logger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const usageLimits = await checkUsageLimits(session.user.id)
    const permissions = getUserPermissions(session.user.subscription as any)

    return NextResponse.json({
      usage: {
        reviewsUsed: usageLimits.limits.reviews.used,
        reviewsLimit: usageLimits.limits.reviews.limit,
        repositoriesUsed: usageLimits.limits.repositories.used,
        repositoriesLimit: usageLimits.limits.repositories.limit,
        withinLimits: usageLimits.withinLimits
      },
      permissions
    })
  } catch (error) {
    logger.error('Usage API error', error as Error)
    return NextResponse.json(
      { error: 'Failed to get usage data' },
      { status: 500 }
    )
  }
}
