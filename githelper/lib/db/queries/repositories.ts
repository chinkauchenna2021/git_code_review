import prisma  from '../client'

export class RepositoryQueries {
  static async findByGithubId(githubId: number) {
    return prisma.repository.findUnique({
      where: { githubId },
      include: { owner: true, installation: true }
    })
  }

  static async findActiveByOwner(ownerId: string) {
    return prisma.repository.findMany({
      where: { ownerId, isActive: true },
      orderBy: { updatedAt: 'desc' }
    })
  }

  static async toggleActiveStatus(id: string, isActive: boolean) {
    return prisma.repository.update({
      where: { id },
      data: { isActive }
    })
  }

  static async syncFromGitHub(githubRepos: any[], ownerId: string, installationId?: string) {
    const operations = githubRepos.map(repo =>
      prisma.repository.upsert({
        where: { githubId: repo.id },
        update: {
          name: repo.name,
          fullName: repo.full_name,
          private: repo.private,
          defaultBranch: repo.default_branch,
          language: repo.language,
          updatedAt: new Date()
        },
        create: {
          githubId: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          private: repo.private,
          defaultBranch: repo.default_branch,
          language: repo.language,
          ownerId,
          installationId,
          isActive: false
        }
      })
    )

    return prisma.$transaction(operations)
  }

  static async getRepositoryStats(repositoryId: string, days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    return prisma.review.groupBy({
      by: ['status'],
      where: {
        repositoryId,
        createdAt: { gte: startDate }
      },
      _count: { id: true }
    })
  }
}
