// types/auth/better-auth.types.ts
import { User, Session } from "better-auth/types"

// ===========================
// EXTENDED USER TYPES
// ===========================

export interface ExtendedUser extends User {
  githubId?: string
  githubUsername?: string
  lastLoginAt?: Date
  reviewsUsed?: number
  subscription?: UserSubscription
  preferences?: UserPreferences
  stats?: UserStats
  permissions?: UserPermissions
  organizations?: OrganizationMembership[]
}

// ===========================
// USER PREFERENCES
// ===========================

export interface UserPreferences {
  id: string
  userId: string
  theme: "LIGHT" | "DARK" | "SYSTEM"
  language: string
  timezone?: string
  emailNotifications: boolean
  reviewReminders: boolean
  webhookNotifications: boolean
  slackNotifications: boolean
  defaultReviewSettings: {
    autoAssign: boolean
    requireApproval: boolean
    checkPullRequests: boolean
    checkCommits: boolean
  }
  codeReviewPreferences: {
    focusAreas: string[]
    severity: "low" | "medium" | "high"
    includeStyleGuide: boolean
    includeSecurityCheck: boolean
    includePerformanceCheck: boolean
  }
  createdAt: Date
  updatedAt: Date
}

// ===========================
// USER STATS
// ===========================

export interface UserStats {
  activeRepositories: number
  totalReviews: number
  reviewsThisMonth: number
  averageReviewTime: number
  issuesFound: number
  issuesFixed: number
  codeQualityScore: number
}

// ===========================
// SUBSCRIPTION TYPES
// ===========================

export interface UserSubscription {
  id: string
  userId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  trialEnd?: Date
  metadata?: Record<string, any>
  limits: SubscriptionLimits
  usage: SubscriptionUsage
  createdAt: Date
  updatedAt: Date
}

export type SubscriptionPlan = "FREE" | "PRO" | "TEAM" | "ENTERPRISE"

export type SubscriptionStatus = 
  | "ACTIVE" 
  | "CANCELED" 
  | "INCOMPLETE" 
  | "INCOMPLETE_EXPIRED" 
  | "PAST_DUE" 
  | "TRIALING" 
  | "UNPAID"

export interface SubscriptionLimits {
  reviews: number
  repositories: number
  teamMembers: number
  apiCalls: number
  webhooks: number
  customPrompts: number
  storageGB: number
}

export interface SubscriptionUsage {
  reviews: number
  repositories: number
  teamMembers: number
  apiCalls: number
  webhooks: number
  customPrompts: number
  storageGB: number
  periodStart: Date
  periodEnd: Date
}

// ===========================
// PERMISSIONS
// ===========================

export interface UserPermissions {
  canCreateReview: boolean
  canAccessPremiumFeatures: boolean
  canManageTeam: boolean
  canAccessAnalytics: boolean
  canCustomizePrompts: boolean
  canExportReports: boolean
  canManageBilling: boolean
  canAccessAPI: boolean
  canManageWebhooks: boolean
  maxRepositories: number
  maxReviewsPerMonth: number
  maxTeamMembers: number
}

// ===========================
// ORGANIZATION TYPES
// ===========================

export interface OrganizationMembership {
  id: string
  organizationId: string
  userId: string
  role: OrganizationRole
  permissions: OrganizationPermissions
  joinedAt: Date
  organization: {
    id: string
    name: string
    slug: string
    image?: string
    plan: SubscriptionPlan
    memberCount: number
  }
}

export type OrganizationRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"

export interface OrganizationPermissions {
  canManageMembers: boolean
  canManageRepositories: boolean
  canManageBilling: boolean
  canManageSettings: boolean
  canCreateReviews: boolean
  canViewAnalytics: boolean
  canManageWebhooks: boolean
  canManageIntegrations: boolean
}

// ===========================
// SESSION TYPES
// ===========================

export interface ExtendedSession extends Session {
  user: ExtendedUser
  githubAccessToken?: string
  githubRefreshToken?: string
  activeOrganization?: {
    id: string
    name: string
    role: OrganizationRole
  }
}

// ===========================
// AUTH CONTEXT TYPES
// ===========================

export interface AuthContextType {
  user: ExtendedUser | null
  session: ExtendedSession | null
  isAuthenticated: boolean
  isLoading: boolean
  organizations: OrganizationMembership[]
  activeOrganization: OrganizationMembership | null
  permissions: UserPermissions | null
  signIn: (provider?: string, options?: SignInOptions) => Promise<void>
  signOut: (options?: SignOutOptions) => Promise<void>
  signUp: (data: SignUpData) => Promise<void>
  updateUser: (data: Partial<ExtendedUser>) => Promise<void>
  switchOrganization: (organizationId: string) => Promise<void>
  refreshSession: () => Promise<void>
}

// ===========================
// AUTH HOOK TYPES
// ===========================

export interface UseAuthReturn extends AuthContextType {
  status: "loading" | "authenticated" | "unauthenticated"
  githubToken?: string
  githubUsername?: string
}

// ===========================
// AUTH OPTIONS TYPES
// ===========================

export interface SignInOptions {
  callbackUrl?: string
  redirect?: boolean
  organizationId?: string
}

export interface SignOutOptions {
  callbackUrl?: string
  redirect?: boolean
}

export interface SignUpData {
  name: string
  email: string
  password?: string
  provider?: string
  organizationInviteToken?: string
}

// ===========================
// SERVER-SIDE AUTH TYPES
// ===========================

export interface AuthServerOptions {
  required?: boolean
  redirectTo?: string
  requireSubscription?: boolean
  requiredPlan?: SubscriptionPlan
  requiredRole?: OrganizationRole
  requiredPermissions?: (keyof UserPermissions)[]
}

export interface ServerAuthSession {
  user: ExtendedUser
  expires: string
  githubAccessToken?: string
  githubId?: number
  githubUsername?: string
}

// ===========================
// ERROR TYPES
// ===========================

export type AuthErrorType =
  | "Configuration"
  | "AccessDenied"
  | "Verification"
  | "Default"
  | "EmailSignInError"
  | "SessionTokenError"
  | "CallbackRouteError"
  | "CredentialsSignin"
  | "EmailCreateAccount"
  | "InvalidCredentials"
  | "AccountNotLinked"
  | "EmailSignInError"
  | "CallbackRouteError"
  | "OAuthAccountNotLinked"
  | "EmailCreateAccount"
  | "EmailSignin"
  | "SessionRequired"

export interface AuthError {
  type: AuthErrorType
  message: string
  details?: string
  code?: string
}

// ===========================
// MIDDLEWARE TYPES
// ===========================

export interface AuthMiddlewareConfig {
  publicPaths: string[]
  authPaths: string[]
  adminPaths: string[]
  afterSignInRedirect: string
  afterSignOutRedirect: string
  organizationRedirect?: string
}

export interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean
  requireSubscription?: boolean
  requiredPlan?: SubscriptionPlan
  requiredRole?: OrganizationRole
  requiredPermissions?: (keyof UserPermissions)[]
}

// ===========================
// API TYPES
// ===========================

export interface APIAuthResponse<T = any> {
  success: boolean
  data?: T
  error?: AuthError
  message?: string
}

export interface TokenValidation {
  isValid: boolean
  isExpired: boolean
  expiresAt?: Date
  scopes?: string[]
  refreshed?: boolean
}

// ===========================
// GITHUB INTEGRATION TYPES
// ===========================

export interface GitHubProfile {
  id: number
  login: string
  name: string | null
  email: string | null
  avatar_url: string
  bio: string | null
  company: string | null
  location: string | null
  blog: string | null
  twitter_username: string | null
  public_repos: number
  public_gists: number
  followers: number
  following: number
  created_at: string
  updated_at: string
  plan?: {
    name: string
    space: number
    private_repos: number
    collaborators: number
  }
}

export interface GitHubToken {
  access_token: string
  token_type: string
  scope: string
  expires_in?: number
  refresh_token?: string
  refresh_token_expires_in?: number
}

// ===========================
// INVITATION TYPES
// ===========================

export type InvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED"

export interface TeamInvitation {
  id: string
  teamId: string
  email: string
  role: string
  token: string
  status: InvitationStatus
  invitedBy: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface OrganizationInvitation {
  id: string
  organizationId: string
  email: string
  role: OrganizationRole
  invitedById: string
  token: string
  status: InvitationStatus
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

// ===========================
// AUDIT & LOGGING TYPES
// ===========================

export interface AuditLog {
  id: string
  userId?: string
  action: string
  entity: string
  entityId?: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  requestId?: string
  createdAt: Date
}

// ===========================
// RATE LIMITING TYPES
// ===========================

export interface RateLimit {
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

export interface RateLimitConfig {
  windowMs: number
  max: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (req: Request) => string
}

// ===========================
// WEBHOOK TYPES
// ===========================

export interface WebhookEvent {
  id: string
  type: string
  data: Record<string, any>
  userId?: string
  organizationId?: string
  timestamp: Date
}

// ===========================
// TYPE GUARDS
// ===========================

export function isExtendedUser(user: any): user is ExtendedUser {
  return user && typeof user === 'object' && 'id' in user && 'email' in user
}

export function hasPermission(
  user: ExtendedUser | null, 
  permission: keyof UserPermissions
): boolean {
  return user?.permissions?.[permission] === true
}

export function hasRole(
  user: ExtendedUser | null,
  role: OrganizationRole,
  organizationId?: string
): boolean {
  if (!user?.organizations) return false
  
  if (organizationId) {
    const membership = user.organizations.find(org => org.organizationId === organizationId)
    return membership?.role === role
  }
  
  return user.organizations.some(org => org.role === role)
}

export function hasSubscription(
  user: ExtendedUser | null,
  plan?: SubscriptionPlan
): boolean {
  if (!user?.subscription || user.subscription.status !== "ACTIVE") {
    return false
  }
  
  if (plan) {
    return user.subscription.plan === plan
  }
  
  return true
}

// ===========================
// UTILITY TYPES
// ===========================

export type WithAuth<T = {}> = T & {
  user: ExtendedUser
}

export type WithOptionalAuth<T = {}> = T & {
  user?: ExtendedUser | null
}

export type AuthPageProps = {
  params: { [key: string]: string | string[] | undefined }
  searchParams: { [key: string]: string | string[] | undefined }
}

export type ProtectedPageProps<T = {}> = WithAuth<T & AuthPageProps>

// ===========================
// CONSTANTS
// ===========================

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = ["FREE", "PRO", "TEAM", "ENTERPRISE"]
export const ORGANIZATION_ROLES: OrganizationRole[] = ["OWNER", "ADMIN", "MEMBER", "VIEWER"]
export const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  "ACTIVE", 
  "CANCELED", 
  "INCOMPLETE", 
  "INCOMPLETE_EXPIRED", 
  "PAST_DUE", 
  "TRIALING", 
  "UNPAID"
]

// ===========================
// DEFAULT VALUES
// ===========================

export const DEFAULT_USER_PREFERENCES: Omit<UserPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  theme: "SYSTEM",
  language: "en",
  timezone: undefined,
  emailNotifications: true,
  reviewReminders: true,
  webhookNotifications: false,
  slackNotifications: false,
  defaultReviewSettings: {
    autoAssign: true,
    requireApproval: false,
    checkPullRequests: true,
    checkCommits: false,
  },
  codeReviewPreferences: {
    focusAreas: ["security", "performance", "maintainability"],
    severity: "medium",
    includeStyleGuide: true,
    includeSecurityCheck: true,
    includePerformanceCheck: true,
  },
}

export const DEFAULT_PERMISSIONS: UserPermissions = {
  canCreateReview: false,
  canAccessPremiumFeatures: false,
  canManageTeam: false,
  canAccessAnalytics: false,
  canCustomizePrompts: false,
  canExportReports: false,
  canManageBilling: false,
  canAccessAPI: false,
  canManageWebhooks: false,
  maxRepositories: 0,
  maxReviewsPerMonth: 0,
  maxTeamMembers: 0,
}