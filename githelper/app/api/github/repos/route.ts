import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Octokit } from '@octokit/rest'
import { prisma } from '@/lib/db/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.githubAccessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const octokit = new Octokit({
      auth: session.githubAccessToken
    })

    // Get user's repositories
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      visibility: 'all',
      sort: 'updated',
      per_page: 100
    })

    // Filter for repositories with admin access
    const adminRepos = repos.filter(repo => repo.permissions?.admin)

    // Sync with database
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! }
    })

    if (user) {
      await Promise.all(
        adminRepos.map(repo => 
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
              ownerId: user.id,
              isActive: false
            }
          })
        )
      )
    }

    return NextResponse.json({
      repositories: adminRepos.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        private: repo.private,
        language: repo.language,
        defaultBranch: repo.default_branch,
        updatedAt: repo.updated_at
      }))
    })

  } catch (error) {
    console.error('Error fetching repositories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repositories' }, 
      { status: 500 }
    )
  }
}
