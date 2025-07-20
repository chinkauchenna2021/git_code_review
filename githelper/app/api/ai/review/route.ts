import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { analyzePullRequest } from '@/lib/ai/review-engine'
import { prisma } from '@/lib/db/client'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      repositoryId, 
      pullRequestNumber, 
      files,
      prData 
    } = await request.json()

    // Check if repository is active for this user
    const repository = await prisma.repository.findFirst({
      where: {
        githubId: repositoryId,
        owner: { email: session.user?.email! },
        isActive: true
      }
    })

    if (!repository) {
      return NextResponse.json({ error: 'Repository not found or inactive' }, { status: 404 })
    }

    // Check user's review quota
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
      include: { subscription: true }
    })

    // Perform AI analysis
    const analysis = await analyzePullRequest({
      files,
      prData,
      repository: {
        language: repository.language,
        name: repository.name
      }
    })

    // Save review to database
    const review = await prisma.review.create({
      data: {
        repositoryId: repository.id,
        pullRequestNumber,
        pullRequestId: prData.id,
        status: 'completed',
        aiAnalysis: analysis,
        createdAt: new Date()
      }
    })

    // Update user's usage
    await prisma.user.update({
      where: { id: user!.id },
      data: { 
        reviewsUsed: { increment: 1 },
        lastReviewAt: new Date()
      }
    })

    return NextResponse.json({
      reviewId: review.id,
      analysis
    })

  } catch (error) {
    console.error('AI Review error:', error)
    return NextResponse.json(
      { error: 'Review analysis failed' }, 
      { status: 500 }
    )
  }
}