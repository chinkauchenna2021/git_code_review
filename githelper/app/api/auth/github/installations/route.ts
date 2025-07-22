import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, getUserGitHubInstallations } from '@/lib/auth/utils'
import { logger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const installations = await getUserGitHubInstallations(session.user.id)

    return NextResponse.json({
      installations: installations.map((installation: { installationId: any; accountType: any; accountLogin: any; isActive: any; repositories: string | any[]; createdAt: any; updatedAt: any }) => ({
        id: installation.installationId,
        accountType: installation.accountType,
        accountLogin: installation.accountLogin,
        isActive: installation.isActive,
        repositoryCount: installation.repositories.length,
        repositories: installation.repositories,
        createdAt: installation.createdAt,
        updatedAt: installation.updatedAt
      }))
    })
  } catch (error) {
    logger.error('GitHub installations API error', error as Error)
    return NextResponse.json(
      { error: 'Failed to get GitHub installations' },
      { status: 500 }
    )
  }
}

