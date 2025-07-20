import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db/client'
import { Octokit } from '@octokit/rest'
import { createAppAuth } from '@octokit/auth-app'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const installationId = searchParams.get('installation_id')
    const setupAction = searchParams.get('setup_action')

    if (!installationId) {
      return NextResponse.json({ error: 'Missing installation_id' }, { status: 400 })
    }

    // Create GitHub App authentication
    const appOctokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: process.env.GITHUB_APP_ID!,
        privateKey: process.env.GITHUB_PRIVATE_KEY!,
        installationId: parseInt(installationId)
      }
    })

    // Get installation details
    const { data: installation } = await appOctokit.rest.apps.getInstallation({
      installation_id: parseInt(installationId)
    })

    // Get repositories included in the installation
    const { data: repositories } = await appOctokit.rest.apps.listReposAccessibleToInstallation()

    // Find or create user
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Save installation to database
    const savedInstallation = await prisma.githubInstallation.upsert({
      where: { installationId: parseInt(installationId) },
      update: {
        userId: user.id,
        accountType: installation.account?.type || 'User',
        accountLogin: installation.account?.login || '',
        updatedAt: new Date()
      },
      create: {
        installationId: parseInt(installationId),
        userId: user.id,
        accountType: installation.account?.type || 'User',
        accountLogin: installation.account?.login || '',
        createdAt: new Date()
      }
    })

    // Sync repositories
    await Promise.all(
      repositories.repositories.map(async (repo) => {
        await prisma.repository.upsert({
          where: { githubId: repo.id },
          update: {
            name: repo.name,
            fullName: repo.full_name,
            private: repo.private,
            defaultBranch: repo.default_branch,
            language: repo.language,
            installationId: savedInstallation.id,
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
            installationId: savedInstallation.id,
            isActive: false
          }
        })
      })
    )

    // Redirect to dashboard with success message
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard?installation=success&repos=${repositories.repositories.length}`
    )

  } catch (error) {
    console.error('GitHub installation error:', error)
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard?installation=error`
    )
  }
}

// Handle GitHub App installation setup
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate GitHub App installation URL
    const installUrl = `https://github.com/apps/${process.env.GITHUB_APP_NAME}/installations/new`
    
    return NextResponse.json({
      installUrl,
      message: 'Redirect user to GitHub App installation'
    })

  } catch (error) {
    console.error('GitHub App setup error:', error)
    return NextResponse.json(
      { error: 'Failed to setup GitHub App' }, 
      { status: 500 }
    )
  }
}
