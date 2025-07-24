import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import  prisma  from '@/lib/db/client'
import { setupWebhook, removeWebhook } from '@/lib/github/webhooks'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.githubAccessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const repository = await prisma.repository.findFirst({
      where: {
        githubId: parseInt(params.id),
        owner: { email: session.user?.email! }
      }
    })

    if (!repository) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 })
    }

    const { isActive } = await request.json()

    if (isActive) {
      // Setup GitHub webhook
      const webhookId = await setupWebhook(
        session.githubAccessToken,
        repository.fullName
      )
      
      await prisma.repository.update({
        where: { id: repository.id },
        data: { 
          isActive: true,
          webhookId: webhookId?.toString()
        }
      })
    } else {
      // Remove webhook
      if (repository.webhookId) {
        await removeWebhook(
          session.githubAccessToken,
          repository.fullName,
          parseInt(repository.webhookId)
        )
      }

      await prisma.repository.update({
        where: { id: repository.id },
        data: { 
          isActive: false,
          webhookId: null
        }
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error toggling repository:', error)
    return NextResponse.json(
      { error: 'Failed to toggle repository' }, 
      { status: 500 }
    )
  }
}
