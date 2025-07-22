import { NextRequest, NextResponse } from 'next/server'
import { handleAuthError } from '@/lib/auth/utils'
import { logger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const error = searchParams.get('error')
    
    if (!error) {
      return NextResponse.json(
        { error: 'No error specified' },
        { status: 400 }
      )
    }

    const errorInfo = handleAuthError(error)
    
    logger.warn('Auth error handled', {
      error,
      type: errorInfo.type,
      message: errorInfo.message
    })

    return NextResponse.json(errorInfo)
  } catch (error) {
    logger.error('Auth error handler failed', error as Error)
    return NextResponse.json(
      { error: 'Failed to handle auth error' },
      { status: 500 }
    )
  }
}
