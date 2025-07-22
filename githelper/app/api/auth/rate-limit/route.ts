import { NextRequest, NextResponse } from 'next/server'
import { checkAuthRateLimit } from '@/lib/auth/utils'

export async function GET(request: NextRequest) {
    //@ts-ignore
  const clientIP = request.ip || 
    request.headers.get('x-forwarded-for')?.split(',')[0] || 
    'unknown'

  const isAllowed = checkAuthRateLimit(clientIP)
  
  return NextResponse.json({
    allowed: isAllowed,
    ip: clientIP,
    timestamp: new Date().toISOString()
  })
}
