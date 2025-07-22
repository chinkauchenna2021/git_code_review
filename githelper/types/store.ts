export interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  githubUsername: string | null
  githubId: number | null
  reviewsUsed: number
  lastReviewAt: Date | null
  createdAt: Date
  subscription: Subscription | null
}

export interface Subscription {
  id: string
  plan: 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE'
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE'
  currentPeriodEnd: Date
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
}

export interface Repository {
  id: string
  githubId: number
  name: string
  fullName: string
  private: boolean
  language: string | null
  defaultBranch: string
  isActive: boolean
  webhookId: string | null
  createdAt: Date
  updatedAt: Date
  reviewCount?: number
  averageScore?: number
}

export interface Review {
  id: string
  repositoryId: string
  pullRequestNumber: number
  pullRequestId: number
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  aiAnalysis: AIAnalysis | null
  createdAt: Date
  updatedAt: Date
  repository: {
    name: string
    fullName: string
    language: string | null
  }
}

export interface AIAnalysis {
  overallScore: number
  summary: string
  issues: Array<{
    type: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    message: string
    file: string
    line: number
    suggestion?: string
    cweId?: string
  }>
  suggestions: Array<{
    type: string
    message: string
    file: string
  }>
  confidence: number
  language: string
  processingTime?: number
  tokensUsed?: number
}

export interface PullRequest {
  id: number
  number: number
  title: string
  body: string | null
  state: 'open' | 'closed' | 'draft'
  createdAt: string
  updatedAt: string
  user: {
    login: string
    avatar_url: string
  }
  base: {
    ref: string
    sha: string
  }
  head: {
    ref: string
    sha: string
  }
  files?: Array<{
    filename: string
    status: string
    additions: number
    deletions: number
    changes: number
    patch?: string
  }>
}

export interface AnalyticsData {
  overview: {
    totalUsers: number
    activeUsers: number
    totalRepositories: number
    activeRepositories: number
    totalReviews: number
    averageScore: number
    totalIssuesFound: number
    criticalIssues: number
    subscriptionRevenue: number
    growthRate: number
  }
  trends: Array<{
    date: string
    reviewCount: number
    averageScore: number
    totalIssues: number
    criticalIssues: number
    processingTime: number
  }>
  languages: Array<{
    language: string
    repositoryCount: number
    reviewCount: number
    averageScore: number
    issueCount: number
    popularityRank: number
  }>
}

export interface NotificationPreferences {
  email: {
    reviewCompleted: boolean
    criticalIssues: boolean
    weeklyReports: boolean
    teamUpdates: boolean
  }
  slack: {
    enabled: boolean
    webhookUrl: string | null
    channelId: string | null
  }
  discord: {
    enabled: boolean
    webhookUrl: string | null
  }
}

export interface Team {
  id: string
  name: string
  description: string | null
  ownerId: string
  createdAt: Date
  members: Array<{
    id: string
    userId: string
    role: 'OWNER' | 'ADMIN' | 'MEMBER'
    joinedAt: Date
    user: {
      name: string | null
      email: string
      image: string | null
    }
  }>
}
