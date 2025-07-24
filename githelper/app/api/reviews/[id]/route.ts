import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma  from '@/lib/db/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const review = await prisma.review.findFirst({
      where: {
        id: params.id,
        repository: { ownerId: user.id }
      },
      include: {
        repository: {
          select: { name: true, fullName: true, language: true, githubId: true }
        }
      }
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: review.id,
      pullRequestNumber: review.pullRequestNumber,
      pullRequestId: review.pullRequestId,
      status: review.status,
      repository: review.repository,
      aiAnalysis: review.aiAnalysis,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt
    })

  } catch (error) {
    console.error('Review fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review' }, 
      { status: 500 }
    )
  }
}

// Delete a review
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const review = await prisma.review.findFirst({
      where: {
        id: params.id,
        repository: { ownerId: user.id }
      }
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    await prisma.review.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Review deleted successfully' })

  } catch (error) {
    console.error('Review deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete review' }, 
      { status: 500 }
    )
  }
}