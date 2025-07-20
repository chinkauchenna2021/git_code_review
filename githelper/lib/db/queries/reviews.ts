import { prisma } from '../client'
import { Prisma } from '@prisma/client'

export class ReviewQueries {
  static async findById(id: string) {
    return prisma.review.findUnique({
      where: { id },
      include: {
        repository: {
          select: { name: true, fullName: true, language: true }
        }
      }
    })
  }

  static async findByRepository(
    repositoryId: string,
    options: {
      page?: number
      limit?: number
      status?: string
    } = {}
  ) {
    const { page = 1, limit = 20, status } = options
    const skip = (page - 1) * limit

    const where: Prisma.ReviewWhereInput = { repositoryId }
    if (status) {
      where.status = status as any
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          repository: {
            select: { name: true, fullName: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.review.count({ where })
    ])

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  static async createReview(data: {
    repositoryId: string
    pullRequestNumber: number
    pullRequestId: number
    status: string
    aiAnalysis?: any
  }) {
    return prisma.review.create({
      data: {
        id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        createdAt: new Date()
      }
    })
  }

  static async updateReviewStatus(id: string, status: string, aiAnalysis?: any) {
    return prisma.review.update({
      where: { id },
      data: {
        status,
        aiAnalysis,
        updatedAt: new Date()
      }
    })
  }

  static async getReviewTrends(userId: string, days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    return prisma.$queryRaw`
      SELECT 
        DATE(r.createdAt) as date,
        COUNT(*) as reviewCount,
        AVG(CAST(r.aiAnalysis->>'$.overallScore' AS DECIMAL(3,1))) as avgScore,
        SUM(JSON_LENGTH(r.aiAnalysis->'$.issues')) as totalIssues
      FROM Review r
      JOIN Repository repo ON r.repositoryId = repo.id
      WHERE repo.ownerId = ${userId}
        AND r.createdAt >= ${startDate}
        AND r.aiAnalysis IS NOT NULL
      GROUP BY DATE(r.createdAt)
      ORDER BY date ASC
    `
  }

  static async getLanguageStats(userId: string) {
    return prisma.$queryRaw`
      SELECT 
        repo.language,
        COUNT(*) as reviewCount,
        AVG(CAST(r.aiAnalysis->>'$.overallScore' AS DECIMAL(3,1))) as avgScore
      FROM Review r
      JOIN Repository repo ON r.repositoryId = repo.id
      WHERE repo.ownerId = ${userId}
        AND r.aiAnalysis IS NOT NULL
        AND repo.language IS NOT NULL
      GROUP BY repo.language
      ORDER BY reviewCount DESC
    `
  }
}
