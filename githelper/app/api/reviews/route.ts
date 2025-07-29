import { NextRequest, NextResponse } from 'next/server'
import { prisma }  from '@/lib/db/client'
import { getServerSession } from '@/lib/auth/better-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const repositoryId = searchParams.get('repositoryId')

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const where: any = {
      repository: { ownerId: user.id }
    }

    if (status) {
      where.status = status
    }

    if (repositoryId) {
      where.repositoryId = repositoryId
    }

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          repository: {
            select: { name: true, fullName: true, language: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.review.count({ where })
    ])

    return NextResponse.json({
      reviews: reviews.map((review:any) => ({
        id: review.id,
        pullRequestNumber: review.pullRequestNumber,
        pullRequestId: review.pullRequestId,
        status: review.status,
        repository: review.repository,
        createdAt: review.createdAt,
        summary: review.aiAnalysis ? {
          issuesFound: review.aiAnalysis.issues?.length || 0,
          suggestionsCount: review.aiAnalysis.suggestions?.length || 0,
          overallScore: review.aiAnalysis.overallScore
        } : null
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Reviews fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' }, 
      { status: 500 }
    )
  }
}
