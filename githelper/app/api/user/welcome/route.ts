import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import  prisma  from '@/lib/db/client'
import { logger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const { completed } = await request.json()

    if (completed) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { 
          updatedAt: new Date()
          // You might want to add a welcomeCompleted field to your schema
        }
      })

      logger.info('User completed welcome flow', {
        userId: session.user.id
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Welcome completion error', error as Error)
    return NextResponse.json(
      { error: 'Failed to complete welcome' },
      { status: 500 }
    )
  }
}