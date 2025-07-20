import { GitHubAPI } from './api'
import { prisma } from '@/lib/db/client'

export async function setupWebhook(accessToken: string, fullName: string) {
  const [owner, repo] = fullName.split('/')
  const github = new GitHubAPI(accessToken)
  
  try {
    const webhook = await github.createWebhook(owner, repo)
    return webhook.data.id
  } catch (error) {
    console.error('Failed to setup webhook:', error)
    throw error
  }
}

export async function removeWebhook(accessToken: string, fullName: string, webhookId: number) {
  const [owner, repo] = fullName.split('/')
  const github = new GitHubAPI(accessToken)
  
  try {
    await github.deleteWebhook(owner, repo, webhookId)
  } catch (error) {
    console.error('Failed to remove webhook:', error)
    throw error
  }
}

export async function handlePullRequestEvent(payload: any) {
  const { action, pull_request, repository } = payload

  if (!['opened', 'synchronize', 'reopened'].includes(action)) {
    return
  }

  // Find repository in database
  const repo = await prisma.repository.findFirst({
    where: { 
      githubId: repository.id,
      isActive: true 
    },
    include: { owner: true }
  })

  if (!repo) {
    console.log('Repository not found or inactive:', repository.full_name)
    return
  }

  // Queue AI review job
  await queueReviewJob({
    repositoryId: repo.id,
    pullRequestNumber: pull_request.number,
    pullRequestId: pull_request.id,
    fullName: repository.full_name,
    headSha: pull_request.head.sha
  })
}