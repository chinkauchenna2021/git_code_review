import { NextRequest, NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import { analyzePullRequest } from '@/lib/ai/review-engine'
import { getServerSession } from '@/lib/auth/better-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.session.token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const owner = searchParams.get('owner')
    const repo = searchParams.get('repo')

    if (!owner || !repo) {
      return NextResponse.json({ error: 'Missing owner or repo' }, { status: 400 })
    }

    const octokit = new Octokit({
      auth: session.session.token
    })

    // Get PR details
    const { data: pr } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: parseInt(params.id)
    })

    // Get PR files
    const { data: files } = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: parseInt(params.id)
    })

    return NextResponse.json({
      pr: {
        id: pr.id,
        number: pr.number,
        title: pr.title,
        body: pr.body,
        state: pr.state,
        createdAt: pr.created_at,
        updatedAt: pr.updated_at,
        user: pr.user,
        base: pr.base,
        head: pr.head
      },
      files: files.map(file => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        patch: file.patch
      }))
    })

  } catch (error) {
    console.error('Error fetching PR:', error)
    return NextResponse.json(
      { error: 'Failed to fetch PR' }, 
      { status: 500 }
    )
  }
}
