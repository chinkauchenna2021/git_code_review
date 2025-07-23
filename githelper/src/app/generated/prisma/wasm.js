
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  expires_at: 'expires_at',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  sessionToken: 'sessionToken',
  userId: 'userId',
  expires: 'expires'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  emailVerified: 'emailVerified',
  name: 'name',
  image: 'image',
  githubId: 'githubId',
  githubUsername: 'githubUsername',
  reviewsUsed: 'reviewsUsed',
  lastReviewAt: 'lastReviewAt',
  emailNotifications: 'emailNotifications',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  identifier: 'identifier',
  token: 'token',
  expires: 'expires'
};

exports.Prisma.SubscriptionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  stripeCustomerId: 'stripeCustomerId',
  stripeSubscriptionId: 'stripeSubscriptionId',
  stripePriceId: 'stripePriceId',
  plan: 'plan',
  status: 'status',
  currentPeriodStart: 'currentPeriodStart',
  currentPeriodEnd: 'currentPeriodEnd',
  cancelAtPeriodEnd: 'cancelAtPeriodEnd',
  canceledAt: 'canceledAt',
  reviewsLimit: 'reviewsLimit',
  repositoriesLimit: 'repositoriesLimit',
  teamMembersLimit: 'teamMembersLimit',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InvoiceScalarFieldEnum = {
  id: 'id',
  subscriptionId: 'subscriptionId',
  stripeInvoiceId: 'stripeInvoiceId',
  amountPaid: 'amountPaid',
  currency: 'currency',
  status: 'status',
  invoiceNumber: 'invoiceNumber',
  invoiceUrl: 'invoiceUrl',
  paidAt: 'paidAt',
  dueDate: 'dueDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UsageRecordScalarFieldEnum = {
  id: 'id',
  subscriptionId: 'subscriptionId',
  metric: 'metric',
  quantity: 'quantity',
  timestamp: 'timestamp',
  metadata: 'metadata'
};

exports.Prisma.GitHubInstallationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  installationId: 'installationId',
  accountType: 'accountType',
  accountLogin: 'accountLogin',
  accountId: 'accountId',
  isActive: 'isActive',
  suspendedAt: 'suspendedAt',
  suspendedBy: 'suspendedBy',
  permissions: 'permissions',
  repositorySelection: 'repositorySelection',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RepositoryScalarFieldEnum = {
  id: 'id',
  ownerId: 'ownerId',
  installationId: 'installationId',
  githubId: 'githubId',
  name: 'name',
  fullName: 'fullName',
  private: 'private',
  description: 'description',
  language: 'language',
  defaultBranch: 'defaultBranch',
  isActive: 'isActive',
  webhookId: 'webhookId',
  autoReview: 'autoReview',
  reviewRules: 'reviewRules',
  excludePaths: 'excludePaths',
  includePaths: 'includePaths',
  minimumScore: 'minimumScore',
  autoCommentThreshold: 'autoCommentThreshold',
  blockMergeThreshold: 'blockMergeThreshold',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PullRequestScalarFieldEnum = {
  id: 'id',
  repositoryId: 'repositoryId',
  githubId: 'githubId',
  number: 'number',
  title: 'title',
  body: 'body',
  state: 'state',
  isDraft: 'isDraft',
  mergeable: 'mergeable',
  mergeableState: 'mergeableState',
  headBranch: 'headBranch',
  baseBranch: 'baseBranch',
  headSha: 'headSha',
  baseSha: 'baseSha',
  authorLogin: 'authorLogin',
  authorId: 'authorId',
  additions: 'additions',
  deletions: 'deletions',
  changedFiles: 'changedFiles',
  githubCreatedAt: 'githubCreatedAt',
  githubUpdatedAt: 'githubUpdatedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ReviewScalarFieldEnum = {
  id: 'id',
  repositoryId: 'repositoryId',
  pullRequestId: 'pullRequestId',
  ownerId: 'ownerId',
  pullRequestNumber: 'pullRequestNumber',
  pullRequestGithubId: 'pullRequestGithubId',
  status: 'status',
  aiAnalysis: 'aiAnalysis',
  overallScore: 'overallScore',
  confidence: 'confidence',
  language: 'language',
  framework: 'framework',
  filesAnalyzed: 'filesAnalyzed',
  linesOfCode: 'linesOfCode',
  processingTime: 'processingTime',
  tokensUsed: 'tokensUsed',
  retryCount: 'retryCount',
  errorMessage: 'errorMessage',
  commentPosted: 'commentPosted',
  commentId: 'commentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  completedAt: 'completedAt'
};

exports.Prisma.IssueScalarFieldEnum = {
  id: 'id',
  reviewId: 'reviewId',
  type: 'type',
  severity: 'severity',
  category: 'category',
  fileName: 'fileName',
  lineNumber: 'lineNumber',
  columnNumber: 'columnNumber',
  title: 'title',
  description: 'description',
  suggestion: 'suggestion',
  codeSnippet: 'codeSnippet',
  cweId: 'cweId',
  cveId: 'cveId',
  isResolved: 'isResolved',
  resolvedAt: 'resolvedAt',
  resolvedBy: 'resolvedBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SuggestionScalarFieldEnum = {
  id: 'id',
  reviewId: 'reviewId',
  type: 'type',
  priority: 'priority',
  fileName: 'fileName',
  lineNumber: 'lineNumber',
  title: 'title',
  description: 'description',
  example: 'example',
  isImplemented: 'isImplemented',
  implementedAt: 'implementedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CommentScalarFieldEnum = {
  id: 'id',
  reviewId: 'reviewId',
  pullRequestId: 'pullRequestId',
  type: 'type',
  content: 'content',
  githubCommentId: 'githubCommentId',
  isPosted: 'isPosted',
  fileName: 'fileName',
  lineNumber: 'lineNumber',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TeamScalarFieldEnum = {
  id: 'id',
  ownerId: 'ownerId',
  name: 'name',
  description: 'description',
  slug: 'slug',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TeamMemberScalarFieldEnum = {
  id: 'id',
  teamId: 'teamId',
  userId: 'userId',
  role: 'role',
  joinedAt: 'joinedAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TeamRepositoryScalarFieldEnum = {
  id: 'id',
  teamId: 'teamId',
  repositoryId: 'repositoryId',
  canReview: 'canReview',
  canAdmin: 'canAdmin',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TeamInvitationScalarFieldEnum = {
  id: 'id',
  teamId: 'teamId',
  email: 'email',
  role: 'role',
  token: 'token',
  status: 'status',
  invitedBy: 'invitedBy',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ApiKeyScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  name: 'name',
  keyHash: 'keyHash',
  keyPreview: 'keyPreview',
  scopes: 'scopes',
  rateLimit: 'rateLimit',
  lastUsedAt: 'lastUsedAt',
  usageCount: 'usageCount',
  isActive: 'isActive',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WebhookScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  url: 'url',
  secret: 'secret',
  events: 'events',
  isActive: 'isActive',
  lastTriggered: 'lastTriggered',
  retryCount: 'retryCount',
  timeout: 'timeout',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WebhookDeliveryScalarFieldEnum = {
  id: 'id',
  webhookId: 'webhookId',
  event: 'event',
  payload: 'payload',
  requestUrl: 'requestUrl',
  requestHeaders: 'requestHeaders',
  responseStatus: 'responseStatus',
  responseHeaders: 'responseHeaders',
  responseBody: 'responseBody',
  attempts: 'attempts',
  status: 'status',
  errorMessage: 'errorMessage',
  createdAt: 'createdAt',
  deliveredAt: 'deliveredAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  action: 'action',
  entity: 'entity',
  entityId: 'entityId',
  oldValues: 'oldValues',
  newValues: 'newValues',
  metadata: 'metadata',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  requestId: 'requestId',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  title: 'title',
  message: 'message',
  data: 'data',
  isRead: 'isRead',
  readAt: 'readAt',
  channels: 'channels',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SystemMetricScalarFieldEnum = {
  id: 'id',
  name: 'name',
  value: 'value',
  unit: 'unit',
  tags: 'tags',
  timestamp: 'timestamp'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.Plan = exports.$Enums.Plan = {
  FREE: 'FREE',
  PRO: 'PRO',
  TEAM: 'TEAM',
  ENTERPRISE: 'ENTERPRISE'
};

exports.SubscriptionStatus = exports.$Enums.SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
  PAST_DUE: 'PAST_DUE',
  UNPAID: 'UNPAID',
  INCOMPLETE: 'INCOMPLETE'
};

exports.InvoiceStatus = exports.$Enums.InvoiceStatus = {
  DRAFT: 'DRAFT',
  OPEN: 'OPEN',
  PAID: 'PAID',
  UNCOLLECTIBLE: 'UNCOLLECTIBLE',
  VOID: 'VOID'
};

exports.UsageMetric = exports.$Enums.UsageMetric = {
  REVIEWS: 'REVIEWS',
  API_CALLS: 'API_CALLS',
  TEAM_MEMBERS: 'TEAM_MEMBERS',
  REPOSITORIES: 'REPOSITORIES'
};

exports.AccountType = exports.$Enums.AccountType = {
  USER: 'USER',
  ORGANIZATION: 'ORGANIZATION'
};

exports.PullRequestState = exports.$Enums.PullRequestState = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  MERGED: 'MERGED'
};

exports.ReviewStatus = exports.$Enums.ReviewStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
};

exports.IssueType = exports.$Enums.IssueType = {
  BUG: 'BUG',
  SECURITY: 'SECURITY',
  PERFORMANCE: 'PERFORMANCE',
  STYLE: 'STYLE',
  MAINTAINABILITY: 'MAINTAINABILITY',
  DOCUMENTATION: 'DOCUMENTATION',
  TESTING: 'TESTING'
};

exports.IssueSeverity = exports.$Enums.IssueSeverity = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INFO: 'INFO'
};

exports.IssueCategory = exports.$Enums.IssueCategory = {
  CODE_QUALITY: 'CODE_QUALITY',
  SECURITY_VULNERABILITY: 'SECURITY_VULNERABILITY',
  PERFORMANCE_ISSUE: 'PERFORMANCE_ISSUE',
  STYLE_VIOLATION: 'STYLE_VIOLATION',
  BEST_PRACTICE: 'BEST_PRACTICE',
  DOCUMENTATION: 'DOCUMENTATION',
  TEST_COVERAGE: 'TEST_COVERAGE'
};

exports.SuggestionType = exports.$Enums.SuggestionType = {
  IMPROVEMENT: 'IMPROVEMENT',
  OPTIMIZATION: 'OPTIMIZATION',
  REFACTOR: 'REFACTOR',
  PATTERN: 'PATTERN',
  LIBRARY: 'LIBRARY'
};

exports.SuggestionPriority = exports.$Enums.SuggestionPriority = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
};

exports.CommentType = exports.$Enums.CommentType = {
  GENERAL: 'GENERAL',
  INLINE: 'INLINE',
  SUGGESTION: 'SUGGESTION',
  ISSUE: 'ISSUE'
};

exports.TeamRole = exports.$Enums.TeamRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER'
};

exports.InvitationStatus = exports.$Enums.InvitationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  EXPIRED: 'EXPIRED'
};

exports.ApiScope = exports.$Enums.ApiScope = {
  READ_REPOSITORIES: 'READ_REPOSITORIES',
  WRITE_REPOSITORIES: 'WRITE_REPOSITORIES',
  READ_REVIEWS: 'READ_REVIEWS',
  WRITE_REVIEWS: 'WRITE_REVIEWS',
  READ_ANALYTICS: 'READ_ANALYTICS',
  ADMIN: 'ADMIN'
};

exports.WebhookEvent = exports.$Enums.WebhookEvent = {
  REVIEW_CREATED: 'REVIEW_CREATED',
  REVIEW_COMPLETED: 'REVIEW_COMPLETED',
  REVIEW_FAILED: 'REVIEW_FAILED',
  ISSUE_FOUND: 'ISSUE_FOUND',
  SUBSCRIPTION_UPDATED: 'SUBSCRIPTION_UPDATED'
};

exports.DeliveryStatus = exports.$Enums.DeliveryStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  RETRY: 'RETRY'
};

exports.AuditAction = exports.$Enums.AuditAction = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  INVITE: 'INVITE',
  ACCEPT: 'ACCEPT',
  DECLINE: 'DECLINE'
};

exports.AuditEntity = exports.$Enums.AuditEntity = {
  USER: 'USER',
  REPOSITORY: 'REPOSITORY',
  REVIEW: 'REVIEW',
  TEAM: 'TEAM',
  SUBSCRIPTION: 'SUBSCRIPTION',
  API_KEY: 'API_KEY',
  WEBHOOK: 'WEBHOOK'
};

exports.NotificationType = exports.$Enums.NotificationType = {
  REVIEW_COMPLETED: 'REVIEW_COMPLETED',
  CRITICAL_ISSUE_FOUND: 'CRITICAL_ISSUE_FOUND',
  SUBSCRIPTION_EXPIRING: 'SUBSCRIPTION_EXPIRING',
  TEAM_INVITATION: 'TEAM_INVITATION',
  SYSTEM_ALERT: 'SYSTEM_ALERT'
};

exports.NotificationChannel = exports.$Enums.NotificationChannel = {
  EMAIL: 'EMAIL',
  IN_APP: 'IN_APP',
  WEBHOOK: 'WEBHOOK',
  SLACK: 'SLACK'
};

exports.Prisma.ModelName = {
  Account: 'Account',
  Session: 'Session',
  User: 'User',
  VerificationToken: 'VerificationToken',
  Subscription: 'Subscription',
  Invoice: 'Invoice',
  UsageRecord: 'UsageRecord',
  GitHubInstallation: 'GitHubInstallation',
  Repository: 'Repository',
  PullRequest: 'PullRequest',
  Review: 'Review',
  Issue: 'Issue',
  Suggestion: 'Suggestion',
  Comment: 'Comment',
  Team: 'Team',
  TeamMember: 'TeamMember',
  TeamRepository: 'TeamRepository',
  TeamInvitation: 'TeamInvitation',
  ApiKey: 'ApiKey',
  Webhook: 'Webhook',
  WebhookDelivery: 'WebhookDelivery',
  AuditLog: 'AuditLog',
  Notification: 'Notification',
  SystemMetric: 'SystemMetric'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
