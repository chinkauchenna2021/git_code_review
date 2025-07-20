import { prisma } from '../client'
import { Prisma } from '@prisma/client'

export class UserQueries {
  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        subscription: true,
        repositories: {
          where: { isActive: true },
          select: { id: true, name: true, fullName: true }
        },
        _count: {
          select: { repositories: true, reviews: true }
        }
      }
    })
  }

  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { subscription: true }
    })
  }

  static async updateUsage(userId: string, increment: number = 1) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        reviewsUsed: { increment },
        lastReviewAt: new Date()
      }
    })
  }

  static async resetMonthlyUsage(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { reviewsUsed: 0 }
    })
  }

  static async getUsersWithExpiredSubscriptions() {
    return prisma.user.findMany({
      where: {
        subscription: {
          status: 'active',
          currentPeriodEnd: {
            lt: new Date()
          }
        }
      },
      include: { subscription: true }
    })
  }

  static async getUserAnalytics(userId: string, days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const [reviewCount, issueCount, avgScore] = await Promise.all([
      prisma.review.count({
        where: {
          repository: { ownerId: userId },
          createdAt: { gte: startDate }
        }
      }),
      prisma.review.aggregate({
        where: {
          repository: { ownerId: userId },
          createdAt: { gte: startDate },
          aiAnalysis: { path: ['issues'], array_contains: [] }
        },
        _sum: { id: true }
      }),
      prisma.review.aggregate({
        where: {
          repository: { ownerId: userId },
          createdAt: { gte: startDate }
        },
        _avg: { id: true }
      })
    ])

    return {
      reviewCount,
      issueCount: issueCount._sum.id || 0,
      avgScore: avgScore._avg.id || 0
    }
  }
}