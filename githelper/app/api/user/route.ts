// app/api/user/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma  from '@/lib/db/client'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! },
      include: {
        subscription: true,
        repositories: {
          where: { isActive: true },
          select: { id: true, name: true, fullName: true, language: true }
        },
        _count: {
          select: {
            repositories: true,
            reviews: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      githubUsername: user.githubUsername,
      subscription: user.subscription,
      stats: {
        totalRepositories: user._count.repositories,
        totalReviews: user._count.reviews,
        reviewsUsed: user.reviewsUsed,
        activeRepositories: user.repositories.length
      },
      repositories: user.repositories,
      createdAt: user.createdAt,
      lastReviewAt: user.lastReviewAt
    })

  } catch (error) {
    console.error('User fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user data' }, 
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()
    const allowedUpdates = ['name', 'githubUsername']
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = updates[key]
        return obj
      }, {})

    const user = await prisma.user.update({
      where: { email: session.user?.email! },
      data: {
        ...filteredUpdates,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        githubUsername: user.githubUsername
      }
    })

  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' }, 
      { status: 500 }
    )
  }
}