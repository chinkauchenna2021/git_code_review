
import { prisma } from '../db/client'
import { redis } from '../cache/redis'
import { logger } from '../utils/logger'

export interface EventData {
  userId?: string
  sessionId?: string
  metadata?: Record<string, any>
  timestamp?: Date
}

export interface ReviewEventData extends EventData {
  repositoryId: string
  pullRequestId: string
  reviewId: string
  score?: number
  issuesFound?: number
  language?: string
  processingTime?: number
  tokensUsed?: number
}

export interface UserEventData extends EventData {
  action: string
  entity: string
  entityId?: string
  ipAddress?: string
  userAgent?: string
}

export interface SubscriptionEventData extends EventData {
  plan: string
  action: 'upgraded' | 'downgraded' | 'cancelled' | 'renewed'
  previousPlan?: string
  amount?: number
}

export interface GitHubEventData extends EventData {
  installationId: number
  accountType: string
  repositoryCount?: number
  action: 'installed' | 'uninstalled' | 'suspended'
}

export interface APIEventData extends EventData {
  endpoint: string
  method: string
  statusCode: number
  responseTime: number
  requestSize?: number
  responseSize?: number
}

export interface ErrorEventData extends EventData {
  error: Error
  context?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  stackTrace?: string
}

export interface PerformanceEventData extends EventData {
  operation: string
  duration: number
  memoryUsage?: number
  cpuUsage?: number
}

export class EventTracker {
  private static batchSize = 100
  private static batchTimeout = 5000 // 5 seconds
  private static eventBatch: any[] = []
  private static batchTimer: NodeJS.Timeout | null = null

  // =========================
  // REVIEW EVENTS
  // =========================

  static async trackReviewStarted(data: ReviewEventData): Promise<void> {
    const event = {
      type: 'review_started',
      userId: data.userId,
      repositoryId: data.repositoryId,
      pullRequestId: data.pullRequestId,
      reviewId: data.reviewId,
      language: data.language,
      metadata: {
        ...data.metadata,
        sessionId: data.sessionId
      },
      timestamp: data.timestamp || new Date()
    }

    await this.recordEvent(event)
    await this.updateRealTimeMetrics('reviews_started', 1)
    await this.updateLanguageMetrics(data.language, 'started')
    
    logger.info('Review started event tracked', { 
      reviewId: data.reviewId,
      repositoryId: data.repositoryId,
      language: data.language
    })
  }

  static async trackReviewCompleted(data: ReviewEventData): Promise<void> {
    const event = {
      type: 'review_completed',
      userId: data.userId,
      repositoryId: data.repositoryId,
      pullRequestId: data.pullRequestId,
      reviewId: data.reviewId,
      score: data.score,
      issuesFound: data.issuesFound,
      language: data.language,
      processingTime: data.processingTime,
      tokensUsed: data.tokensUsed,
      metadata: data.metadata,
      timestamp: data.timestamp || new Date()
    }

    await this.recordEvent(event)
    await this.updateRealTimeMetrics('reviews_completed', 1)
    await this.updateLanguageMetrics(data.language, 'completed', data.score)
    await this.updateScoreMetrics(data.score)
    await this.updatePerformanceMetrics(data.processingTime, data.tokensUsed)
    
    logger.info('Review completed event tracked', { 
      reviewId: data.reviewId,
      score: data.score,
      issuesFound: data.issuesFound,
      processingTime: data.processingTime
    })
  }

  static async trackReviewFailed(data: ReviewEventData & { error: string; retryCount?: number }): Promise<void> {
    const event = {
      type: 'review_failed',
      userId: data.userId,
      repositoryId: data.repositoryId,
      pullRequestId: data.pullRequestId,
      reviewId: data.reviewId,
      error: data.error,
      retryCount: data.retryCount || 0,
      language: data.language,
      metadata: data.metadata,
      timestamp: data.timestamp || new Date()
    }

    await this.recordEvent(event)
    await this.updateRealTimeMetrics('reviews_failed', 1)
    await this.updateErrorMetrics('review_failure', data.error)
    
    logger.error('Review failed event tracked', new Error(data.error), { 
      reviewId: data.reviewId,
      repositoryId: data.repositoryId,
      retryCount: data.retryCount
    })
  }

  static async trackCriticalIssueFound(data: ReviewEventData & { 
    issueType: string
    severity: string
    fileName?: string
    lineNumber?: number
    cweId?: string
  }): Promise<void> {
    const event = {
      type: 'critical_issue_found',
      userId: data.userId,
      repositoryId: data.repositoryId,
      reviewId: data.reviewId,
      issueType: data.issueType,
      severity: data.severity,
      fileName: data.fileName,
      lineNumber: data.lineNumber,
      cweId: data.cweId,
      language: data.language,
      metadata: data.metadata,
      timestamp: data.timestamp || new Date()
    }

    await this.recordEvent(event)
    await this.updateRealTimeMetrics('critical_issues_found', 1)
    await this.updateIssueTypeMetrics(data.issueType, data.severity)
    await this.updateSecurityMetrics(data.issueType, data.cweId)
    
    // Send immediate alert for critical security issues
    if (data.severity === 'critical' && data.issueType === 'security') {
      await this.triggerCriticalAlert(data)
    }
    
    logger.warn('Critical issue found event tracked', { 
      reviewId: data.reviewId,
      issueType: data.issueType,
      severity: data.severity,
      fileName: data.fileName
    })
  }

  // =========================
  // USER BEHAVIOR EVENTS
  // =========================

  static async trackUserAction(data: UserEventData): Promise<void> {
    const event = {
      type: 'user_action',
      userId: data.userId,
      action: data.action,
      entity: data.entity,
      entityId: data.entityId,
      sessionId: data.sessionId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      metadata: data.metadata,
      timestamp: data.timestamp || new Date()
    }

    await this.recordEvent(event)
    await this.updateUserActivityMetrics(data.userId!, data.action)
    await this.updateFeatureUsageMetrics(data.action, data.entity)
    
    logger.info('User action tracked', { 
      userId: data.userId,
      action: data.action,
      entity: data.entity 
    })
  }

  static async trackRepositoryToggled(data: EventData & { 
    repositoryId: string
    isActive: boolean
    repositoryName: string
    language?: string
  }): Promise<void> {
    const event = {
      type: 'repository_toggled',
      userId: data.userId,
      repositoryId: data.repositoryId,
      repositoryName: data.repositoryName,
      isActive: data.isActive,
      language: data.language,
      metadata: data.metadata,
      timestamp: data.timestamp || new Date()
    }

    await this.recordEvent(event)
    
    const metric = data.isActive ? 'repositories_activated' : 'repositories_deactivated'
    await this.updateRealTimeMetrics(metric, 1)
    await this.updateRepositoryMetrics(data.language, data.isActive)
    
    logger.info('Repository toggle tracked', { 
      repositoryId: data.repositoryId,
      repositoryName: data.repositoryName,
      isActive: data.isActive 
    })
  }

  static async trackLoginEvent(data: UserEventData & { 
    provider: string
    isFirstLogin?: boolean
    loginDuration?: number
  }): Promise<void> {
    const event = {
      type: 'user_login',
      userId: data.userId,
      provider: data.provider,
      isFirstLogin: data.isFirstLogin || false,
      loginDuration: data.loginDuration,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      metadata: data.metadata,
      timestamp: data.timestamp || new Date()
    }

    await this.recordEvent(event)
    await this.updateRealTimeMetrics('user_logins', 1)
    await this.updateAuthMetrics(data.provider, data.isFirstLogin)
    
    if (data.isFirstLogin) {
      await this.updateRealTimeMetrics('new_users', 1)
    }
    
    logger.info('Login event tracked', { 
      userId: data.userId,
      provider: data.provider,
      isFirstLogin: data.isFirstLogin
    })
  }

  // =========================
  // SUBSCRIPTION EVENTS
  // =========================

  static async trackSubscriptionChange(data: SubscriptionEventData): Promise<void> {
    const event = {
      type: 'subscription_changed',
      userId: data.userId,
      plan: data.plan,
      action: data.action,
      previousPlan: data.previousPlan,
      amount: data.amount,
      metadata: data.metadata,
      timestamp: data.timestamp || new Date()
    }

    await this.recordEvent(event)
    await this.updateSubscriptionMetrics(data.action, data.plan, data.previousPlan)
    await this.updateRevenueMetrics(data.action, data.amount)
    
    logger.info('Subscription change tracked', { 
      userId: data.userId,
      action: data.action,
      plan: data.plan,
      amount: data.amount
    })
  }

  static async trackPaymentEvent(data: EventData & {
    amount: number
    currency: string
    status: 'succeeded' | 'failed' | 'pending'
    stripePaymentId?: string
    plan?: string
  }): Promise<void> {
    const event = {
      type: 'payment_event',
      userId: data.userId,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      stripePaymentId: data.stripePaymentId,
      plan: data.plan,
      metadata: data.metadata,
      timestamp: data.timestamp || new Date()
    }

    await this.recordEvent(event)
    await this.updatePaymentMetrics(data.status, data.amount, data.currency)
    
    if (data.status === 'succeeded') {
      await this.updateRealTimeMetrics('successful_payments', 1)
      await this.updateRevenueMetrics('payment', data.amount)
    } else if (data.status === 'failed') {
      await this.updateRealTimeMetrics('failed_payments', 1)
    }
    
    logger.info('Payment event tracked', { 
      userId: data.userId,
      amount: data.amount,
      status: data.status
    })
  }

  // =========================
  // GITHUB INTEGRATION EVENTS
  // =========================

  static async trackGitHubInstallation(data: GitHubEventData): Promise<void> {
    const event = {
      type: 'github_installation',
      userId: data.userId,
      installationId: data.installationId,
      accountType: data.accountType,
      repositoryCount: data.repositoryCount,
      action: data.action,
      metadata: data.metadata,
      timestamp: data.timestamp || new Date()
    }

    await this.recordEvent(event)
    await this.updateRealTimeMetrics(`github_${data.action}`, 1)
    await this.updateIntegrationMetrics('github', data.action, data.accountType)
    
    logger.info('GitHub installation tracked', { 
      userId: data.userId,
      installationId: data.installationId,
      action: data.action,
      repositoryCount: data.repositoryCount
    })
  }

  static async trackWebhookEvent(data: EventData & {
    event: string
    installationId: number
    repositoryId?: string
    processingTime?: number
    success: boolean
  }): Promise<void> {
    const event = {
      type: 'webhook_event',
      event: data.event,
      installationId: data.installationId,
      repositoryId: data.repositoryId,
      processingTime: data.processingTime,
      success: data.success,
      metadata: data.metadata,
      timestamp: data.timestamp || new Date()
    }

    await this.recordEvent(event)
    await this.updateWebhookMetrics(data.event, data.success)
    
    if (data.processingTime) {
      await this.updatePerformanceMetrics(data.processingTime)
    }
    
    logger.info('Webhook event tracked', { 
      event: data.event,
      installationId: data.installationId,
      success: data.success
    })
  }

  // =========================
  // API & PERFORMANCE EVENTS
  // =========================

  static async trackAPICall(data: APIEventData): Promise<void> {
    const event = {
      type: 'api_call',
      userId: data.userId,
      endpoint: data.endpoint,
      method: data.method,
      statusCode: data.statusCode,
      responseTime: data.responseTime,
      requestSize: data.requestSize,
      responseSize: data.responseSize,
      metadata: data.metadata,
      timestamp: data.timestamp || new Date()
    }

    // Use batching for high-volume API events
    await this.addToBatch(event)
    await this.updateAPIMetrics(data.endpoint, data.method, data.statusCode, data.responseTime)
    
    // Only log slow or error API calls to avoid noise
    if (data.responseTime > 5000 || data.statusCode >= 400) {
      logger.warn('API call tracked', { 
        endpoint: data.endpoint,
        method: data.method,
        statusCode: data.statusCode,
        responseTime: data.responseTime
      })
    }
  }

  static async trackPerformanceMetric(data: PerformanceEventData): Promise<void> {
    const event = {
      type: 'performance_metric',
      userId: data.userId,
      operation: data.operation,
      duration: data.duration,
      memoryUsage: data.memoryUsage,
      cpuUsage: data.cpuUsage,
      metadata: data.metadata,
      timestamp: data.timestamp || new Date()
    }

    await this.recordEvent(event)
    await this.updateOperationMetrics(data.operation, data.duration)
    
    // Log performance issues
    if (data.duration > 10000) { // 10 seconds
      logger.warn('Slow operation tracked', { 
        operation: data.operation,
        duration: data.duration,
        memoryUsage: data.memoryUsage
      })
    }
  }

  // =========================
  // ERROR TRACKING
  // =========================

  static async trackError(data: ErrorEventData): Promise<void> {
    const event = {
      type: 'error',
      userId: data.userId,
      errorMessage: data.error.message,
      errorStack: data.error.stack,
      context: data.context,
      severity: data.severity,
      metadata: {
        ...data.metadata,
        errorName: data.error.name,
        errorCode: (data.error as any).code
      },
      timestamp: data.timestamp || new Date()
    }

    await this.recordEvent(event)
    await this.updateErrorMetrics(data.severity, data.context)
    await this.updateRealTimeMetrics('errors', 1)
    
    // Send alerts for critical errors
    if (data.severity === 'critical') {
      await this.triggerErrorAlert(data)
    }
    
    logger.error('Error event tracked', data.error, { 
      context: data.context,
      severity: data.severity,
      userId: data.userId 
    })
  }

  // =========================
  // BATCH PROCESSING
  // =========================

  private static async addToBatch(event: any): Promise<void> {
    this.eventBatch.push(event)
    
    if (this.eventBatch.length >= this.batchSize) {
      await this.flushBatch()
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flushBatch(), this.batchTimeout)
    }
  }

  private static async flushBatch(): Promise<void> {
    if (this.eventBatch.length === 0) return

    const events = [...this.eventBatch]
    this.eventBatch = []
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }

    try {
      // Batch insert events
      await prisma.auditLog.createMany({
        data: events.map(event => ({
          userId: event.userId || null,
          action: this.mapEventToAction(event.type),
          entity: this.mapEventToEntity(event.type),
          entityId: event.reviewId || event.repositoryId || event.installationId?.toString(),
          newValues: event,
          metadata: event.metadata,
          createdAt: event.timestamp
        }))
      })

      logger.info('Event batch flushed', { count: events.length })
    } catch (error) {
      logger.error('Failed to flush event batch', error as Error, { count: events.length })
      
      // Re-add events to batch for retry
      this.eventBatch.unshift(...events)
    }
  }

  // =========================
  // REAL-TIME METRICS UPDATES
  // =========================

  private static async updateRealTimeMetrics(metric: string, increment: number = 1): Promise<void> {
    try {
      const date = new Date().toISOString().split('T')[0]
      const hour = new Date().toISOString().split(':')[0]
      
      // Daily metrics
      const dailyKey = `metric:${metric}:${date}`
      await redis.incr(dailyKey, 86400) // 24 hours TTL
      
      // Hourly metrics
      const hourlyKey = `metric:${metric}:${hour}`
      await redis.incr(hourlyKey, 3600) // 1 hour TTL
      
      // Global counter
      const globalKey = `metric:${metric}:total`
      await redis.incr(globalKey)
      
    } catch (error) {
      logger.error('Failed to update real-time metrics', error as Error, { metric })
    }
  }

  private static async updateLanguageMetrics(language?: string, action?: string, score?: number): Promise<void> {
    if (!language) return

    try {
      const date = new Date().toISOString().split('T')[0]
      const key = `language:${language}:${date}`
      
      await redis.hset(key, action || 'count', '1')
      await redis.expire(key, 86400) // 24 hours TTL
      
      if (score !== undefined) {
        await redis.hset(key, 'totalScore', score.toString())
        await redis.hset(key, 'scoreCount', '1')
      }
    } catch (error) {
      logger.error('Failed to update language metrics', error as Error, { language, action, score })
    }
  }

  private static async updateScoreMetrics(score?: number): Promise<void> {
    if (score === undefined) return

    try {
      const date = new Date().toISOString().split('T')[0]
      const key = `scores:${date}`
      
      await redis.hset(key, 'total', score.toString())
      await redis.hset(key, 'count', '1')
      await redis.expire(key, 86400) // 24 hours TTL
    } catch (error) {
      logger.error('Failed to update score metrics', error as Error, { score })
    }
  }

  private static async updatePerformanceMetrics(processingTime?: number, tokensUsed?: number): Promise<void> {
    if (!processingTime) return

    try {
      const date = new Date().toISOString().split('T')[0]
      const key = `performance:${date}`
      
      await redis.hset(key, 'totalTime', processingTime.toString())
      await redis.hset(key, 'count', '1')
      
      if (tokensUsed) {
        await redis.hset(key, 'totalTokens', tokensUsed.toString())
      }
      
      await redis.expire(key, 86400) // 24 hours TTL
    } catch (error) {
      logger.error('Failed to update performance metrics', error as Error, { processingTime, tokensUsed })
    }
  }

  private static async updateIssueTypeMetrics(issueType: string, severity: string): Promise<void> {
    try {
      const date = new Date().toISOString().split('T')[0]
      const key = `issues:${issueType}:${severity}:${date}`
      
      await redis.incr(key, 86400) // 24 hours TTL
    } catch (error) {
      logger.error('Failed to update issue type metrics', error as Error, { issueType, severity })
    }
  }

  private static async updateSecurityMetrics(issueType: string, cweId?: string): Promise<void> {
    if (issueType !== 'security') return

    try {
      const date = new Date().toISOString().split('T')[0]
      const key = `security:${date}`
      
      await redis.hset(key, 'total', '1')
      if (cweId) {
        await redis.hset(key, `cwe_${cweId}`, '1')
      }
      
      await redis.expire(key, 86400) // 24 hours TTL
    } catch (error) {
      logger.error('Failed to update security metrics', error as Error, { issueType, cweId })
    }
  }

  private static async updateUserActivityMetrics(userId: string, action: string): Promise<void> {
    try {
      const date = new Date().toISOString().split('T')[0]
      const key = `user:${userId}:activity:${date}`
      
      await redis.hset(key, action, '1')
      await redis.expire(key, 2592000) // 30 days TTL
    } catch (error) {
      logger.error('Failed to update user activity metrics', error as Error, { userId, action })
    }
  }

  private static async updateFeatureUsageMetrics(action: string, entity: string): Promise<void> {
    try {
      const date = new Date().toISOString().split('T')[0]
      const key = `features:${entity}:${action}:${date}`
      
      await redis.incr(key, 86400) // 24 hours TTL
    } catch (error) {
      logger.error('Failed to update feature usage metrics', error as Error, { action, entity })
    }
  }

  private static async updateRepositoryMetrics(language?: string, isActive?: boolean): Promise<void> {
    try {
      const date = new Date().toISOString().split('T')[0]
      const key = `repositories:${date}`
      
      await redis.hset(key, isActive ? 'activated' : 'deactivated', '1')
      
      if (language) {
        await redis.hset(key, `lang_${language}`, isActive ? '1' : '-1')
      }
      
      await redis.expire(key, 86400) // 24 hours TTL
    } catch (error) {
      logger.error('Failed to update repository metrics', error as Error, { language, isActive })
    }
  }

  private static async updateAuthMetrics(provider: string, isFirstLogin?: boolean): Promise<void> {
    try {
      const date = new Date().toISOString().split('T')[0]
      const key = `auth:${provider}:${date}`
      
      await redis.hset(key, 'logins', '1')
      
      if (isFirstLogin) {
        await redis.hset(key, 'new_users', '1')
      }
      
      await redis.expire(key, 86400) // 24 hours TTL
    } catch (error) {
      logger.error('Failed to update auth metrics', error as Error, { provider, isFirstLogin })
    }
  }

  private static async updateSubscriptionMetrics(action: string, plan: string, previousPlan?: string): Promise<void> {
    try {
      const date = new Date().toISOString().split('T')[0]
      const key = `subscription:${action}:${date}`
      
      await redis.hset(key, plan, '1')
      
      if (previousPlan && action === 'upgraded') {
        await redis.hset(key, `${previousPlan}_to_${plan}`, '1')
      }
      
      await redis.expire(key, 86400) // 24 hours TTL
    } catch (error) {
      logger.error('Failed to update subscription metrics', error as Error, { action, plan })
    }
  }

  private static async updateRevenueMetrics(action: string, amount?: number): Promise<void> {
    if (!amount) return

    try {
      const date = new Date().toISOString().split('T')[0]
      const key = `revenue:${date}`
      
      await redis.hset(key, 'total', amount.toString())
      await redis.hset(key, action, amount.toString())
      
      await redis.expire(key, 86400) // 24 hours TTL
    } catch (error) {
      logger.error('Failed to update revenue metrics', error as Error, { action, amount })
    }
  }

  private static async updatePaymentMetrics(status: string, amount: number, currency: string): Promise<void> {
    try {
      const date = new Date().toISOString().split('T')[0]
      const key = `payments:${status}:${date}`
      
      await redis.hset(key, 'count', '1')
      await redis.hset(key, 'amount', amount.toString())
      await redis.hset(key, currency, amount.toString())
      
      await redis.expire(key, 86400) // 24 hours TTL
    } catch (error) {
      logger.error('Failed to update payment metrics', error as Error, { status, amount, currency })
    }
  }

  private static async updateIntegrationMetrics(integration: string, action: string, accountType: string): Promise<void> {
    try {
      const date = new Date().toISOString().split('T')[0]
      const key = `integration:${integration}:${action}:${date}`
      
      await redis.hset(key, accountType, '1')
      await redis.expire(key, 86400) // 24 hours TTL
    } catch (error) {
      logger.error('Failed to update integration metrics', error as Error, { integration, action, accountType })
    }
  }

  private static async updateWebhookMetrics(event: string, success: boolean): Promise<void> {
    try {
      const date = new Date().toISOString().split('T')[0]
      const key = `webhooks:${event}:${date}`
      
      await redis.hset(key, success ? 'success' : 'failed', '1')
      await redis.expire(key, 86400) // 24 hours TTL
    } catch (error) {
      logger.error('Failed to update webhook metrics', error as Error, { event, success })
    }
  }

  private static async updateAPIMetrics(endpoint: string, method: string, statusCode: number, responseTime: number): Promise<void> {
    try {
      const date = new Date().toISOString().split('T')[0]
      const endpointKey = `api:${endpoint}:${method}:${date}`
      
      await redis.hset(endpointKey, 'calls', '1')
      await redis.hset(endpointKey, 'totalResponseTime', responseTime.toString())
      await redis.hset(endpointKey, `status_${statusCode}`, '1')
      
      await redis.expire(endpointKey, 86400) // 24 hours TTL
    } catch (error) {
      logger.error('Failed to update API metrics', error as Error, { endpoint, method, statusCode })
    }
  }

  private static async updateOperationMetrics(operation: string, duration: number): Promise<void> {
    try {
      const date = new Date().toISOString().split('T')[0]
      const key = `operations:${operation}:${date}`
      
      await redis.hset(key, 'count', '1')
      await redis.hset(key, 'totalDuration', duration.toString())
      
      await redis.expire(key, 86400) // 24 hours TTL
    } catch (error) {
      logger.error('Failed to update operation metrics', error as Error, { operation, duration })
    }
  }

  private static async updateErrorMetrics(severity: string, context?: string): Promise<void> {
    try {
      const date = new Date().toISOString().split('T')[0]
      const key = `errors:${severity}:${date}`
      
      await redis.hset(key, 'count', '1')
      if (context) {
        await redis.hset(key, context, '1')
      }
      
      await redis.expire(key, 86400) // 24 hours TTL
    } catch (error) {
      logger.error('Failed to update error metrics', error as Error, { severity, context })
    }
  }

  // =========================
  // ALERT SYSTEMS
  // =========================

  private static async triggerCriticalAlert(data: any): Promise<void> {
    try {
      // This would integrate with your alerting system (PagerDuty, Slack, etc.)
      const alertData = {
        type: 'critical_security_issue',
        repositoryId: data.repositoryId,
        reviewId: data.reviewId,
        issueType: data.issueType,
        fileName: data.fileName,
        timestamp: new Date()
      }

      // Store alert for processing
      await redis.set(
        `alert:critical:${data.reviewId}:${Date.now()}`,
        JSON.stringify(alertData),
        300 // 5 minutes TTL
      )

      logger.critical('Critical security alert triggered', alertData)
    } catch (error) {
      logger.error('Failed to trigger critical alert', error as Error, { data })
    }
  }

  private static async triggerErrorAlert(data: ErrorEventData): Promise<void> {
    try {
      const alertData = {
        type: 'critical_error',
        userId: data.userId,
        errorMessage: data.error.message,
        context: data.context,
        severity: data.severity,
        timestamp: new Date()
      }

      await redis.set(
        `alert:error:${Date.now()}`,
        JSON.stringify(alertData),
        300 // 5 minutes TTL
      )

      logger.critical('Critical error alert triggered', alertData)
    } catch (error) {
      logger.error('Failed to trigger error alert', error as Error, { data })
    }
  }

  // =========================
  // UTILITY METHODS
  // =========================

  private static async recordEvent(event: any): Promise<void> {
    try {
      // Store in database for permanent record
      await prisma.auditLog.create({
        data: {
          userId: event.userId || null,
          action: this.mapEventToAction(event.type),
          entity: this.mapEventToEntity(event.type),
          entityId: event.reviewId || event.repositoryId || event.installationId?.toString(),
          newValues: event,
          metadata: event.metadata,
          createdAt: event.timestamp
        }
      })

      // Store in Redis for real-time analytics (with TTL)
      const key = `event:${event.type}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`
      await redis.set(key, JSON.stringify(event), 86400) // 24 hours TTL

    } catch (error) {
      logger.error('Failed to record event', error as Error, { event })
    }
  }

  private static mapEventToAction(eventType: string): string {
    const mapping: Record<string, string> = {
      'review_started': 'CREATE',
      'review_completed': 'UPDATE',
      'review_failed': 'UPDATE',
      'critical_issue_found': 'CREATE',
      'repository_toggled': 'UPDATE',
      'subscription_changed': 'UPDATE',
      'payment_event': 'CREATE',
      'github_installation': 'CREATE',
      'webhook_event': 'CREATE',
      'user_login': 'CREATE',
      'user_action': 'UPDATE',
      'api_call': 'CREATE',
      'performance_metric': 'CREATE',
      'error': 'CREATE'
    }
    return mapping[eventType] || 'UPDATE'
  }

  private static mapEventToEntity(eventType: string): string {
    const mapping: Record<string, string> = {
      'review_started': 'REVIEW',
      'review_completed': 'REVIEW',
      'review_failed': 'REVIEW',
      'critical_issue_found': 'REVIEW',
      'repository_toggled': 'REPOSITORY',
      'subscription_changed': 'SUBSCRIPTION',
      'payment_event': 'SUBSCRIPTION',
      'github_installation': 'USER',
      'webhook_event': 'WEBHOOK',
      'user_login': 'USER',
      'user_action': 'USER',
      'api_call': 'API_KEY',
      'performance_metric': 'USER',
      'error': 'USER'
    }
    return mapping[eventType] || 'USER'
  }

  // =========================
  // EVENT RETRIEVAL METHODS
  // =========================

  static async getRecentEvents(userId?: string, limit: number = 100): Promise<any[]> {
    try {
      const where: any = {}
      if (userId) {
        where.userId = userId
      }

      const events = await prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          action: true,
          entity: true,
          newValues: true,
          createdAt: true,
          user: {
            select: { name: true, email: true }
          }
        }
      })

      return events
    } catch (error) {
      logger.error('Failed to get recent events', error as Error, { userId, limit })
      return []
    }
  }

  static async getEventsByType(eventType: string, startDate: Date, endDate?: Date): Promise<any[]> {
    try {
      const endDateTime = endDate || new Date()
      
      const events = await prisma.auditLog.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDateTime
          },
          newValues: {
            path: ['type'],
            equals: eventType
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return events.map(event => event.newValues)
    } catch (error) {
      logger.error('Failed to get events by type', error as Error, { eventType, startDate, endDate })
      return []
    }
  }

  static async getEventStats(startDate: Date, endDate?: Date): Promise<Record<string, number>> {
    try {
      const endDateTime = endDate || new Date()
      
      const stats = await prisma.$queryRaw<Array<{ type: string; count: bigint }>>`
        SELECT 
          JSON_UNQUOTE(JSON_EXTRACT(newValues, '$.type')) as type,
          COUNT(*) as count
        FROM AuditLog
        WHERE createdAt >= ${startDate}
          AND createdAt <= ${endDateTime}
          AND JSON_EXTRACT(newValues, '$.type') IS NOT NULL
        GROUP BY type
        ORDER BY count DESC
      `

      return stats.reduce((acc, stat) => {
        acc[stat.type] = Number(stat.count)
        return acc
      }, {} as Record<string, number>)
    } catch (error) {
      logger.error('Failed to get event stats', error as Error, { startDate, endDate })
      return {}
    }
  }

  // =========================
  // CLEANUP AND MAINTENANCE
  // =========================

  static async cleanupOldEvents(daysToKeep: number = 90): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)
      
      const deletedCount = await prisma.auditLog.deleteMany({
        where: {
          createdAt: { lt: cutoffDate }
        }
      })

      logger.info('Old events cleaned up', { 
        deletedCount: deletedCount.count,
        cutoffDate,
        daysToKeep 
      })
    } catch (error) {
      logger.error('Failed to cleanup old events', error as Error, { daysToKeep })
    }
  }

  static async getEventVolume(timeframe: '1h' | '24h' | '7d' = '24h'): Promise<number> {
    try {
      const hours = timeframe === '1h' ? 1 : timeframe === '24h' ? 24 : 168
      const startDate = new Date(Date.now() - hours * 60 * 60 * 1000)
      
      const count = await prisma.auditLog.count({
        where: {
          createdAt: { gte: startDate }
        }
      })

      return count
    } catch (error) {
      logger.error('Failed to get event volume', error as Error, { timeframe })
      return 0
    }
  }

  // =========================
  // EXPORT METHODS
  // =========================

  static async exportEvents(
    startDate: Date, 
    endDate: Date, 
    userId?: string, 
    eventTypes?: string[]
  ): Promise<any[]> {
    try {
      const where: any = {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }

      if (userId) {
        where.userId = userId
      }

      if (eventTypes && eventTypes.length > 0) {
        where.newValues = {
          path: ['type'],
          in: eventTypes
        }
      }

      const events = await prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      })

      return events.map(event => ({
        id: event.id,
        timestamp: event.createdAt,
        type: (event.newValues as any)?.type,
        action: event.action,
        entity: event.entity,
        userId: event.userId,
        userName: event.user?.name,
        userEmail: event.user?.email,
        data: event.newValues,
        metadata: event.metadata
      }))
    } catch (error) {
      logger.error('Failed to export events', error as Error, { 
        startDate, 
        endDate, 
        userId, 
        eventTypes 
      })
      return []
    }
  }

  // Force flush batch (for shutdown)
  static async shutdown(): Promise<void> {
    await this.flushBatch()
    logger.info('EventTracker shutdown completed')
  }
}

// Auto-flush batch on process exit
process.on('SIGTERM', () => EventTracker.shutdown())
process.on('SIGINT', () => EventTracker.shutdown())