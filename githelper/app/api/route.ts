import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET() {
  return NextResponse.json({
    name: 'DevTeams Copilot API',
    version: '1.0.0',
    description: 'AI-powered code review SaaS API',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      github: '/api/github',
      ai: '/api/ai',
      subscription: '/api/subscription',
      analytics: '/api/analytics',
      team: '/api/team',
      webhooks: '/api/webhooks'
    }
  })
}

// Health check endpoint
export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}

