import { Queue, Worker } from 'bullmq'
import { prisma } from '../db/client'
import { analyzePullRequest } from '../ai/review-engine'
import { GitHubAPI } from '../github/api'

const reviewQueue = new Queue('review-queue', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
})

export interface ReviewJobData {
  repositoryId: string
  pullRequestNumber: number
  pullRequestId: number
  fullName: string
  headSha: string
}

export async function queueReviewJob(data: ReviewJobData) {
  await reviewQueue.add('analyze-pr', data, {
    delay: 5000, // 5 second delay to allow PR to settle
    removeOnComplete: 10,
    removeOnFail: 5
  })
}

// Worker to process review jobs
const reviewWorker = new Worker('review-queue', async (job) => {
  const data = job.data as ReviewJobData
  
  try {
    // Get repository and GitHub installation
    const repository = await prisma.repository.findUnique({
      where: { id: data.repositoryId },
      include: { 
        owner: true,
        installation: true 
      }
    })

    if (!repository?.installation) {
      throw new Error('Repository installation not found')
    }

    // Get PR data from GitHub
    const github = new GitHubAPI(undefined, repository.installation.installationId)
    const [owner, repo] = data.fullName.split('/')
    const { pr, files } = await github.getPullRequest(owner, repo, data.pullRequestNumber)

    // Perform AI analysis
    const analysis = await analyzePullRequest({
      files,
      prData: pr,
      repository: {
        language: repository.language,
        name: repository.name
      }
    })

    // Save review to database
    const review = await prisma.review.create({
      data: {
        repositoryId: repository.id,
        pullRequestNumber: data.pullRequestNumber,
        pullRequestId: data.pullRequestId,
        status: 'completed',
        aiAnalysis: analysis
      }
    })

    // Post comment to GitHub if there are significant issues
    if (analysis.issues.some(issue => ['critical', 'high'].includes(issue.severity))) {
      await postReviewComment(github, owner, repo, data.pullRequestNumber, analysis)
    }

    return { success: true, reviewId: review.id }

  } catch (error) {
    console.error('Review job failed:', error)
    
    // Save failed review
    await prisma.review.create({
      data: {
        repositoryId: data.repositoryId,
        pullRequestNumber: data.pullRequestNumber,
        pullRequestId: data.pullRequestId,
        status: 'failed',
        aiAnalysis: { error: error.message }
      }
    })

    throw error
  }
}, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
})

async function postReviewComment(
  github: GitHubAPI, 
  owner: string, 
  repo: string, 
  pullNumber: number, 
  analysis: any
) {
  const criticalIssues = analysis.issues.filter((issue: any) => issue.severity === 'critical')
  const highIssues = analysis.issues.filter((issue: any) => issue.severity === 'high')

  if (criticalIssues.length === 0 && highIssues.length === 0) return

  const comment = `## 🤖 DevTeams Copilot Review

**Overall Score:** ${analysis.overallScore}/10

${analysis.summary}

### Critical Issues (${criticalIssues.length})
${criticalIssues.map((issue: any) => `
- **${issue.file}:${issue.line}** - ${issue.message}
  ${issue.suggestion ? `💡 *Suggestion: ${issue.suggestion}*` : ''}
`).join('')}

### High Priority Issues (${highIssues.length})
${highIssues.map((issue: any) => `
- **${issue.file}:${issue.line}** - ${issue.message}
  ${issue.suggestion ? `💡 *Suggestion: ${issue.suggestion}*` : ''}
`).join('')}

---
*Powered by DevTeams Copilot - [View detailed analysis](${process.env.NEXTAUTH_URL}/dashboard/reviews)*`

  await github.createComment(owner, repo, pullNumber, comment)
}
