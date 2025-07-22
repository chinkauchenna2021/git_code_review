import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, syncUserWithGitHub } from '@/lib/auth/utils'
import { logger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const githubToken = session.githubAccessToken

    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub token not found' },
        { status: 400 }
      )
    }

    // Fetch GitHub profile
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'DevTeams-Copilot/1.0'
      }
    })

    if (!response.ok) {
      logger.warn('GitHub API request failed', {
        status: response.status,
        statusText: response.statusText,
        userId: session.user.id
      })
      
      return NextResponse.json(
        { error: 'Failed to fetch GitHub profile' },
        { status: response.status }
      )
    }

    const profile = await response.json()

    // Sync user data in background
    syncUserWithGitHub(session.user.id, githubToken).catch(error => {
      logger.error('Background user sync failed', error)
    })

    return NextResponse.json({
      id: profile.id,
      login: profile.login,
      name: profile.name,
      email: profile.email,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      company: profile.company,
      location: profile.location,
      public_repos: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
      created_at: profile.created_at,
      plan: profile.plan
    })
  } catch (error) {
    logger.error('GitHub profile API error', error as Error)
    return NextResponse.json(
      { error: 'Failed to get GitHub profile' },
      { status: 500 }
    )
  }
}