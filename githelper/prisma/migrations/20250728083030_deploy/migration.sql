-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO', 'TEAM', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'PAST_DUE', 'TRIALING', 'UNPAID');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'OPEN', 'PAID', 'UNCOLLECTIBLE', 'VOID');

-- CreateEnum
CREATE TYPE "UsageMetric" AS ENUM ('REVIEWS', 'API_CALLS', 'TEAM_MEMBERS', 'REPOSITORIES', 'WEBHOOKS', 'CUSTOM_PROMPTS', 'STORAGE_GB');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('USER', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "PullRequestState" AS ENUM ('OPEN', 'CLOSED', 'MERGED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "IssueType" AS ENUM ('BUG', 'SECURITY', 'PERFORMANCE', 'STYLE', 'MAINTAINABILITY', 'DOCUMENTATION', 'TESTING');

-- CreateEnum
CREATE TYPE "IssueSeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO');

-- CreateEnum
CREATE TYPE "IssueCategory" AS ENUM ('CODE_QUALITY', 'SECURITY_VULNERABILITY', 'PERFORMANCE_ISSUE', 'STYLE_VIOLATION', 'BEST_PRACTICE', 'DOCUMENTATION', 'TEST_COVERAGE');

-- CreateEnum
CREATE TYPE "SuggestionType" AS ENUM ('IMPROVEMENT', 'OPTIMIZATION', 'REFACTOR', 'PATTERN', 'LIBRARY');

-- CreateEnum
CREATE TYPE "SuggestionPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "CommentType" AS ENUM ('GENERAL', 'INLINE', 'SUGGESTION', 'ISSUE');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ApiScope" AS ENUM ('READ_REPOSITORIES', 'WRITE_REPOSITORIES', 'READ_REVIEWS', 'WRITE_REVIEWS', 'READ_ANALYTICS', 'ADMIN');

-- CreateEnum
CREATE TYPE "WebhookEvent" AS ENUM ('REVIEW_CREATED', 'REVIEW_COMPLETED', 'REVIEW_FAILED', 'ISSUE_FOUND', 'SUBSCRIPTION_UPDATED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'RETRY');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'INVITE', 'ACCEPT', 'DECLINE');

-- CreateEnum
CREATE TYPE "AuditEntity" AS ENUM ('USER', 'REPOSITORY', 'REVIEW', 'TEAM', 'ORGANIZATION', 'SUBSCRIPTION', 'API_KEY', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REVIEW_COMPLETED', 'CRITICAL_ISSUE_FOUND', 'SUBSCRIPTION_EXPIRING', 'TEAM_INVITATION', 'ORGANIZATION_INVITATION', 'SYSTEM_ALERT');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'IN_APP', 'WEBHOOK', 'SLACK');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "image" TEXT,
    "githubId" INTEGER,
    "githubUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewsUsed" INTEGER NOT NULL DEFAULT 0,
    "lastReviewAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "authenticator" (
    "credentialID" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "credentialPublicKey" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "credentialDeviceType" TEXT NOT NULL,
    "credentialBackedUp" BOOLEAN NOT NULL,
    "transports" TEXT,

    CONSTRAINT "authenticator_pkey" PRIMARY KEY ("userId","credentialID")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "ownerId" TEXT NOT NULL,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizationMembership" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizationMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizationInvitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL DEFAULT 'MEMBER',
    "invitedById" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizationInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" "Theme" NOT NULL DEFAULT 'SYSTEM',
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "reviewReminders" BOOLEAN NOT NULL DEFAULT true,
    "webhookNotifications" BOOLEAN NOT NULL DEFAULT false,
    "slackNotifications" BOOLEAN NOT NULL DEFAULT false,
    "defaultReviewSettings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "reviewsLimit" INTEGER NOT NULL DEFAULT 50,
    "repositoriesLimit" INTEGER NOT NULL DEFAULT 1,
    "teamMembersLimit" INTEGER NOT NULL DEFAULT 1,
    "apiCallsLimit" INTEGER NOT NULL DEFAULT 1000,
    "webhooksLimit" INTEGER NOT NULL DEFAULT 0,
    "customPromptsLimit" INTEGER NOT NULL DEFAULT 0,
    "storageGBLimit" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "stripeInvoiceId" TEXT NOT NULL,
    "amountPaid" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "InvoiceStatus" NOT NULL,
    "invoiceNumber" TEXT,
    "invoiceUrl" TEXT,
    "paidAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usageRecord" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "metric" "UsageMetric" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "usageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gitHubInstallation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "installationId" INTEGER NOT NULL,
    "accountType" "AccountType" NOT NULL,
    "accountLogin" TEXT NOT NULL,
    "accountId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "suspendedAt" TIMESTAMP(3),
    "suspendedBy" TEXT,
    "permissions" JSONB,
    "repositorySelection" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gitHubInstallation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repository" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "installationId" TEXT,
    "githubId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "language" TEXT,
    "defaultBranch" TEXT NOT NULL DEFAULT 'main',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "webhookId" TEXT,
    "autoReview" BOOLEAN NOT NULL DEFAULT true,
    "reviewRules" JSONB,
    "excludePaths" TEXT[],
    "includePaths" TEXT[],
    "minimumScore" DOUBLE PRECISION DEFAULT 7.0,
    "autoCommentThreshold" DOUBLE PRECISION DEFAULT 6.0,
    "blockMergeThreshold" DOUBLE PRECISION DEFAULT 4.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pullRequest" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "githubId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "state" "PullRequestState" NOT NULL DEFAULT 'OPEN',
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "mergeable" BOOLEAN,
    "mergeableState" TEXT,
    "headBranch" TEXT NOT NULL,
    "baseBranch" TEXT NOT NULL,
    "headSha" TEXT NOT NULL,
    "baseSha" TEXT NOT NULL,
    "authorLogin" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "additions" INTEGER NOT NULL DEFAULT 0,
    "deletions" INTEGER NOT NULL DEFAULT 0,
    "changedFiles" INTEGER NOT NULL DEFAULT 0,
    "githubCreatedAt" TIMESTAMP(3) NOT NULL,
    "githubUpdatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pullRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "pullRequestId" TEXT,
    "ownerId" TEXT NOT NULL,
    "pullRequestNumber" INTEGER NOT NULL,
    "pullRequestGithubId" INTEGER NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "aiAnalysis" JSONB,
    "overallScore" DOUBLE PRECISION,
    "confidence" DOUBLE PRECISION,
    "language" TEXT,
    "framework" TEXT,
    "filesAnalyzed" INTEGER NOT NULL DEFAULT 0,
    "linesOfCode" INTEGER NOT NULL DEFAULT 0,
    "processingTime" INTEGER,
    "tokensUsed" INTEGER,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "commentPosted" BOOLEAN NOT NULL DEFAULT false,
    "commentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "type" "IssueType" NOT NULL,
    "severity" "IssueSeverity" NOT NULL,
    "category" "IssueCategory" NOT NULL,
    "fileName" TEXT NOT NULL,
    "lineNumber" INTEGER,
    "columnNumber" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "suggestion" TEXT,
    "codeSnippet" TEXT,
    "cweId" TEXT,
    "cveId" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suggestion" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "type" "SuggestionType" NOT NULL,
    "priority" "SuggestionPriority" NOT NULL,
    "fileName" TEXT,
    "lineNumber" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "example" TEXT,
    "isImplemented" BOOLEAN NOT NULL DEFAULT false,
    "implementedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT,
    "pullRequestId" TEXT,
    "type" "CommentType" NOT NULL,
    "content" TEXT NOT NULL,
    "githubCommentId" TEXT,
    "isPosted" BOOLEAN NOT NULL DEFAULT false,
    "fileName" TEXT,
    "lineNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teamRepository" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "canReview" BOOLEAN NOT NULL DEFAULT true,
    "canAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teamRepository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teamInvitation" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'MEMBER',
    "token" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "invitedBy" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teamInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apiKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPreview" TEXT NOT NULL,
    "scopes" "ApiScope"[],
    "rateLimit" INTEGER NOT NULL DEFAULT 1000,
    "lastUsedAt" TIMESTAMP(3),
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT,
    "events" "WebhookEvent"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggered" TIMESTAMP(3),
    "retryCount" INTEGER NOT NULL DEFAULT 3,
    "timeout" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhookDelivery" (
    "id" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "event" "WebhookEvent" NOT NULL,
    "payload" JSONB NOT NULL,
    "requestUrl" TEXT NOT NULL,
    "requestHeaders" JSONB,
    "responseStatus" INTEGER,
    "responseHeaders" JSONB,
    "responseBody" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "webhookDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entity" "AuditEntity" NOT NULL,
    "entityId" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "channels" "NotificationChannel"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "systemMetric" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "tags" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "systemMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_githubId_key" ON "user"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "user_githubUsername_key" ON "user"("githubUsername");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_githubId_idx" ON "user"("githubId");

-- CreateIndex
CREATE INDEX "user_githubUsername_idx" ON "user"("githubUsername");

-- CreateIndex
CREATE INDEX "user_createdAt_idx" ON "user"("createdAt");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "account_provider_providerAccountId_key" ON "account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "session_sessionToken_key" ON "session"("sessionToken");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verificationToken_token_key" ON "verificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationToken_identifier_token_key" ON "verificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "authenticator_credentialID_key" ON "authenticator"("credentialID");

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "organization"("slug");

-- CreateIndex
CREATE INDEX "organization_slug_idx" ON "organization"("slug");

-- CreateIndex
CREATE INDEX "organization_ownerId_idx" ON "organization"("ownerId");

-- CreateIndex
CREATE INDEX "organizationMembership_organizationId_idx" ON "organizationMembership"("organizationId");

-- CreateIndex
CREATE INDEX "organizationMembership_userId_idx" ON "organizationMembership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "organizationMembership_organizationId_userId_key" ON "organizationMembership"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "organizationInvitation_token_key" ON "organizationInvitation"("token");

-- CreateIndex
CREATE INDEX "organizationInvitation_organizationId_idx" ON "organizationInvitation"("organizationId");

-- CreateIndex
CREATE INDEX "organizationInvitation_email_idx" ON "organizationInvitation"("email");

-- CreateIndex
CREATE INDEX "organizationInvitation_token_idx" ON "organizationInvitation"("token");

-- CreateIndex
CREATE INDEX "organizationInvitation_status_idx" ON "organizationInvitation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "userPreferences_userId_key" ON "userPreferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_userId_key" ON "subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_stripeCustomerId_key" ON "subscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_stripeSubscriptionId_key" ON "subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "subscription_stripeCustomerId_idx" ON "subscription"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "subscription_stripeSubscriptionId_idx" ON "subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "subscription_plan_idx" ON "subscription"("plan");

-- CreateIndex
CREATE INDEX "subscription_status_idx" ON "subscription"("status");

-- CreateIndex
CREATE INDEX "subscription_currentPeriodEnd_idx" ON "subscription"("currentPeriodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_stripeInvoiceId_key" ON "invoice"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "invoice_stripeInvoiceId_idx" ON "invoice"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "invoice_subscriptionId_idx" ON "invoice"("subscriptionId");

-- CreateIndex
CREATE INDEX "invoice_status_idx" ON "invoice"("status");

-- CreateIndex
CREATE INDEX "invoice_paidAt_idx" ON "invoice"("paidAt");

-- CreateIndex
CREATE INDEX "usageRecord_subscriptionId_metric_idx" ON "usageRecord"("subscriptionId", "metric");

-- CreateIndex
CREATE INDEX "usageRecord_timestamp_idx" ON "usageRecord"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "gitHubInstallation_installationId_key" ON "gitHubInstallation"("installationId");

-- CreateIndex
CREATE INDEX "gitHubInstallation_installationId_idx" ON "gitHubInstallation"("installationId");

-- CreateIndex
CREATE INDEX "gitHubInstallation_userId_idx" ON "gitHubInstallation"("userId");

-- CreateIndex
CREATE INDEX "gitHubInstallation_accountLogin_idx" ON "gitHubInstallation"("accountLogin");

-- CreateIndex
CREATE INDEX "gitHubInstallation_isActive_idx" ON "gitHubInstallation"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "repository_githubId_key" ON "repository"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "repository_fullName_key" ON "repository"("fullName");

-- CreateIndex
CREATE INDEX "repository_githubId_idx" ON "repository"("githubId");

-- CreateIndex
CREATE INDEX "repository_ownerId_idx" ON "repository"("ownerId");

-- CreateIndex
CREATE INDEX "repository_fullName_idx" ON "repository"("fullName");

-- CreateIndex
CREATE INDEX "repository_isActive_idx" ON "repository"("isActive");

-- CreateIndex
CREATE INDEX "repository_language_idx" ON "repository"("language");

-- CreateIndex
CREATE INDEX "repository_updatedAt_idx" ON "repository"("updatedAt");

-- CreateIndex
CREATE INDEX "pullRequest_repositoryId_idx" ON "pullRequest"("repositoryId");

-- CreateIndex
CREATE INDEX "pullRequest_state_idx" ON "pullRequest"("state");

-- CreateIndex
CREATE INDEX "pullRequest_authorLogin_idx" ON "pullRequest"("authorLogin");

-- CreateIndex
CREATE INDEX "pullRequest_githubUpdatedAt_idx" ON "pullRequest"("githubUpdatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "pullRequest_repositoryId_githubId_key" ON "pullRequest"("repositoryId", "githubId");

-- CreateIndex
CREATE UNIQUE INDEX "pullRequest_repositoryId_number_key" ON "pullRequest"("repositoryId", "number");

-- CreateIndex
CREATE INDEX "review_repositoryId_idx" ON "review"("repositoryId");

-- CreateIndex
CREATE INDEX "review_ownerId_idx" ON "review"("ownerId");

-- CreateIndex
CREATE INDEX "review_status_idx" ON "review"("status");

-- CreateIndex
CREATE INDEX "review_overallScore_idx" ON "review"("overallScore");

-- CreateIndex
CREATE INDEX "review_createdAt_idx" ON "review"("createdAt");

-- CreateIndex
CREATE INDEX "review_pullRequestNumber_repositoryId_idx" ON "review"("pullRequestNumber", "repositoryId");

-- CreateIndex
CREATE INDEX "issue_reviewId_idx" ON "issue"("reviewId");

-- CreateIndex
CREATE INDEX "issue_type_idx" ON "issue"("type");

-- CreateIndex
CREATE INDEX "issue_severity_idx" ON "issue"("severity");

-- CreateIndex
CREATE INDEX "issue_category_idx" ON "issue"("category");

-- CreateIndex
CREATE INDEX "issue_fileName_idx" ON "issue"("fileName");

-- CreateIndex
CREATE INDEX "suggestion_reviewId_idx" ON "suggestion"("reviewId");

-- CreateIndex
CREATE INDEX "suggestion_type_idx" ON "suggestion"("type");

-- CreateIndex
CREATE INDEX "suggestion_priority_idx" ON "suggestion"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "comment_githubCommentId_key" ON "comment"("githubCommentId");

-- CreateIndex
CREATE INDEX "comment_reviewId_idx" ON "comment"("reviewId");

-- CreateIndex
CREATE INDEX "comment_pullRequestId_idx" ON "comment"("pullRequestId");

-- CreateIndex
CREATE INDEX "comment_githubCommentId_idx" ON "comment"("githubCommentId");

-- CreateIndex
CREATE UNIQUE INDEX "team_slug_key" ON "team"("slug");

-- CreateIndex
CREATE INDEX "team_ownerId_idx" ON "team"("ownerId");

-- CreateIndex
CREATE INDEX "team_slug_idx" ON "team"("slug");

-- CreateIndex
CREATE INDEX "teamMember_teamId_idx" ON "teamMember"("teamId");

-- CreateIndex
CREATE INDEX "teamMember_userId_idx" ON "teamMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "teamMember_teamId_userId_key" ON "teamMember"("teamId", "userId");

-- CreateIndex
CREATE INDEX "teamRepository_teamId_idx" ON "teamRepository"("teamId");

-- CreateIndex
CREATE INDEX "teamRepository_repositoryId_idx" ON "teamRepository"("repositoryId");

-- CreateIndex
CREATE UNIQUE INDEX "teamRepository_teamId_repositoryId_key" ON "teamRepository"("teamId", "repositoryId");

-- CreateIndex
CREATE UNIQUE INDEX "teamInvitation_token_key" ON "teamInvitation"("token");

-- CreateIndex
CREATE INDEX "teamInvitation_teamId_idx" ON "teamInvitation"("teamId");

-- CreateIndex
CREATE INDEX "teamInvitation_email_idx" ON "teamInvitation"("email");

-- CreateIndex
CREATE INDEX "teamInvitation_token_idx" ON "teamInvitation"("token");

-- CreateIndex
CREATE INDEX "teamInvitation_status_idx" ON "teamInvitation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "apiKey_keyHash_key" ON "apiKey"("keyHash");

-- CreateIndex
CREATE INDEX "apiKey_userId_idx" ON "apiKey"("userId");

-- CreateIndex
CREATE INDEX "apiKey_keyHash_idx" ON "apiKey"("keyHash");

-- CreateIndex
CREATE INDEX "apiKey_isActive_idx" ON "apiKey"("isActive");

-- CreateIndex
CREATE INDEX "webhook_userId_idx" ON "webhook"("userId");

-- CreateIndex
CREATE INDEX "webhook_isActive_idx" ON "webhook"("isActive");

-- CreateIndex
CREATE INDEX "webhookDelivery_webhookId_idx" ON "webhookDelivery"("webhookId");

-- CreateIndex
CREATE INDEX "webhookDelivery_status_idx" ON "webhookDelivery"("status");

-- CreateIndex
CREATE INDEX "webhookDelivery_createdAt_idx" ON "webhookDelivery"("createdAt");

-- CreateIndex
CREATE INDEX "auditLog_userId_idx" ON "auditLog"("userId");

-- CreateIndex
CREATE INDEX "auditLog_action_idx" ON "auditLog"("action");

-- CreateIndex
CREATE INDEX "auditLog_entity_idx" ON "auditLog"("entity");

-- CreateIndex
CREATE INDEX "auditLog_createdAt_idx" ON "auditLog"("createdAt");

-- CreateIndex
CREATE INDEX "notification_userId_idx" ON "notification"("userId");

-- CreateIndex
CREATE INDEX "notification_type_idx" ON "notification"("type");

-- CreateIndex
CREATE INDEX "notification_isRead_idx" ON "notification"("isRead");

-- CreateIndex
CREATE INDEX "notification_createdAt_idx" ON "notification"("createdAt");

-- CreateIndex
CREATE INDEX "systemMetric_name_idx" ON "systemMetric"("name");

-- CreateIndex
CREATE INDEX "systemMetric_timestamp_idx" ON "systemMetric"("timestamp");

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authenticator" ADD CONSTRAINT "authenticator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizationMembership" ADD CONSTRAINT "organizationMembership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizationMembership" ADD CONSTRAINT "organizationMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizationInvitation" ADD CONSTRAINT "organizationInvitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userPreferences" ADD CONSTRAINT "userPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usageRecord" ADD CONSTRAINT "usageRecord_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gitHubInstallation" ADD CONSTRAINT "gitHubInstallation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repository" ADD CONSTRAINT "repository_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repository" ADD CONSTRAINT "repository_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "gitHubInstallation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pullRequest" ADD CONSTRAINT "pullRequest_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "pullRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue" ADD CONSTRAINT "issue_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestion" ADD CONSTRAINT "suggestion_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "pullRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teamMember" ADD CONSTRAINT "teamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teamMember" ADD CONSTRAINT "teamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teamRepository" ADD CONSTRAINT "teamRepository_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teamRepository" ADD CONSTRAINT "teamRepository_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teamInvitation" ADD CONSTRAINT "teamInvitation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apiKey" ADD CONSTRAINT "apiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhookDelivery" ADD CONSTRAINT "webhookDelivery_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "webhook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditLog" ADD CONSTRAINT "auditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
