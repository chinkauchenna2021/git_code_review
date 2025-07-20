import { Octokit } from '@octokit/rest'
import { createAppAuth } from '@octokit/auth-app'

export class GitHubAPI {
  private octokit: Octokit

  constructor(accessToken?: string, installationId?: number) {
    if (installationId) {
      // GitHub App authentication
      this.octokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
          appId: process.env.GITHUB_APP_ID!,
          privateKey: process.env.GITHUB_PRIVATE_KEY!,
          installationId
        }
      })
    } else if (accessToken) {
      // Personal access token
      this.octokit = new Octokit({ auth: accessToken })
    } else {
      throw new Error('Either accessToken or installationId is required')
    }
  }

  // Simple interface methods
  async getRepositories() {
    const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
      visibility: 'all',
      sort: 'updated',
      per_page: 100
    })
    return data.filter(repo => repo.permissions?.admin)
  }

  async getPullRequest(owner: string, repo: string, pullNumber: number) {
    const [prResponse, filesResponse] = await Promise.all([
      this.octokit.rest.pulls.get({ owner, repo, pull_number: pullNumber }),
      this.octokit.rest.pulls.listFiles({ owner, repo, pull_number: pullNumber })
    ])

    return {
      pr: prResponse.data,
      files: filesResponse.data
    }
  }

  async createComment(owner: string, repo: string, pullNumber: number, body: string) {
    return this.octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pullNumber,
      body
    })
  }

  async createReviewComment(
    owner: string, 
    repo: string, 
    pullNumber: number, 
    commitId: string,
    path: string,
    line: number,
    body: string
  ) {
    return this.octokit.rest.pulls.createReviewComment({
      owner,
      repo,
      pull_number: pullNumber,
      commit_id: commitId,
      path,
      line,
      body
    })
  }

  async createWebhook(owner: string, repo: string) {
    return this.octokit.rest.repos.createWebhook({
      owner,
      repo,
      config: {
        url: `${process.env.NEXTAUTH_URL}/api/webhooks/github`,
        content_type: 'json',
        secret: process.env.GITHUB_WEBHOOK_SECRET
      },
      events: ['pull_request', 'pull_request_review', 'push']
    })
  }

  async deleteWebhook(owner: string, repo: string, hookId: number) {
    return this.octokit.rest.repos.deleteWebhook({
      owner,
      repo,
      hook_id: hookId
    })
  }
}
