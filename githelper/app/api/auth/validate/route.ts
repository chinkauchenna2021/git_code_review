import { NextRequest, NextResponse } from 'next/server'
import { validateGitHubToken } from '@/lib/auth/utils'
import { requireAuth } from '@/lib/auth/utils'
import { logger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    const validation = await validateGitHubToken(token)
    
    logger.info('Token validation completed', {
      userId: session.user.id,
      isValid: validation.isValid,
      isExpired: validation.isExpired
    })

    return NextResponse.json({
      isValid: validation.isValid,
      isExpired: validation.isExpired,
      scopes: validation.scopes
    })
  } catch (error) {
    logger.error('Token validation error', error as Error)
    return NextResponse.json(
      { error: 'Failed to validate token' },
      { status: 500 }
    )
  }
}