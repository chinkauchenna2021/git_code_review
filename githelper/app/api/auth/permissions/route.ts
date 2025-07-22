import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, getUserPermissions, checkUsageLimits } from '@/lib/auth/utils'
import { logger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const permissions = getUserPermissions(user.subscription as any)
    const usageLimits = await checkUsageLimits(user.id)
    
    return NextResponse.json({
      permissions,
      usage: usageLimits,
      subscription: user.subscription
    })
  } catch (error) {
    logger.error('Permissions API error', error as Error)
    return NextResponse.json(
      { error: 'Failed to get permissions' },
      { status: 500 }
    )
  }
}
