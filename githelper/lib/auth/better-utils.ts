// lib/auth/utils.ts
import { headers } from "next/headers"
import { auth } from "./config"
import { prisma } from "@/lib/db/client"
import { logger } from "@/lib/utils/logger"
import type {
  ExtendedUser,
  UserPermissions,
  UserSubscription,
  SubscriptionLimits,
  TokenValidation,
  AuthError,
  OrganizationMembership,
} from "./types"

// ===========================
// SERVER-SIDE AUTH UTILITIES
// ===========================

/**
 * Get the current session on the server
 */
export async function getServerSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    return session
  } catch (error) {
    logger.error("Failed to get server session", error as Error)
    return null
  }
}

/**
 * Require authentication for server-side operations
 */
export async function requireAuth() {
  const session = await getServerSession()
  
  if (!session) {
    throw new Error("Authentication required")
  }
  
  return session
}

/**
 * Get enhanced user data with permissions and subscription
 */
export async function getServerUser(): Promise<ExtendedUser | null> {
  const session = await getServerSession()
  
  if (!session?.user?.id) {
    return null
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
            access_token: !!process.env.INCLUDE_TOKENS,
            refresh_token: !!process.env.INCLUDE_TOKENS,
          }
        },
        subscription: true,
        preferences: true,
        organizationMemberships: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                plan: true,
                _count: {
                  select: {
                    members: true,
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            repositories: true,
            reviews: true,
          }
        }
      }
    })
    
    if (!user) {
      return null
    }
    
    const permissions = await getUserPermissions(user.id)
    const stats = await getUserStats(user.id)
    
    return {
      ...user,
      permissions,
      stats,
      organizations: user.organizationMemberships.map(membership => ({
        id: membership.id,
        organizationId: membership.organizationId,
        userId: membership.userId,
        role: membership.role as any,
        permissions: getOrganizationPermissions(membership.role as any),
        joinedAt: membership.createdAt,
        organization: {
          ...membership.organization,
          memberCount: membership.organization._count.members,
        }
      })),
    } as ExtendedUser
  } catch (error) {
    logger.error("Failed to get server user", error as Error)
    return null
  }
}

/**
 * Get user permissions based on subscription and role
 */
export async function getUserPermissions(userId: string): Promise<UserPermissions> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        subscription: true,
        organizationMemberships: {
          include: {
            organization: true
          }
        }
      }
    })
    
    if (!user) {
      return getDefaultPermissions()
    }
    
    const subscription = user.subscription
    const isSubscribed = subscription?.status === "ACTIVE"
    const plan = subscription?.plan || "FREE"
    
    // Get organization permissions (use highest role if member of multiple orgs)
    const orgPermissions = user.organizationMemberships.reduce((acc, membership) => {
      const orgPerms = getOrganizationPermissions(membership.role as any)
      return {
        canManageTeam: acc.canManageTeam || orgPerms.canManageMembers,
        canAccessAnalytics: acc.canAccessAnalytics || orgPerms.canViewAnalytics,
        canManageBilling: acc.canManageBilling || orgPerms.canManageBilling,
      }
    }, {
      canManageTeam: false,
      canAccessAnalytics: false,
      canManageBilling: false,
    })
    
    return {
      canCreateReview: true,
      canAccessPremiumFeatures: ["PRO", "TEAM", "ENTERPRISE"].includes(plan),
      canManageTeam: orgPermissions.canManageTeam,
      canAccessAnalytics: ["TEAM", "ENTERPRISE"].includes(plan) || orgPermissions.canAccessAnalytics,
      canCustomizePrompts: ["PRO", "TEAM", "ENTERPRISE"].includes(plan),
      canExportReports: ["PRO", "TEAM", "ENTERPRISE"].includes(plan),
      canManageBilling: orgPermissions.canManageBilling,
      canAccessAPI: ["PRO", "TEAM", "ENTERPRISE"].includes(plan),
      canManageWebhooks: ["TEAM", "ENTERPRISE"].includes(plan),
      maxRepositories: getMaxRepositories(plan),
      maxReviewsPerMonth: getMaxReviews(plan),
      maxTeamMembers: getMaxTeamMembers(plan),
    }
  } catch (error) {
    logger.error("Failed to get user permissions", error as Error)
    return getDefaultPermissions()
  }
}

/**
 * Get organization permissions based on role
 */
export function getOrganizationPermissions(role: string) {
  const permissions = {
    canManageMembers: false,
    canManageRepositories: false,
    canManageBilling: false,
    canManageSettings: false,
    canCreateReviews: false,
    canViewAnalytics: false,
    canManageWebhooks: false,
    canManageIntegrations: false,
  }

  switch (role) {
    case "OWNER":
      return {
        ...permissions,
        canManageMembers: true,
        canManageRepositories: true,
        canManageBilling: true,
        canManageSettings: true,
        canCreateReviews: true,
        canViewAnalytics: true,
        canManageWebhooks: true,
        canManageIntegrations: true,
      }
    case "ADMIN":
      return {
        ...permissions,
        canManageMembers: true,
        canManageRepositories: true,
        canManageSettings: true,
        canCreateReviews: true,
        canViewAnalytics: true,
        canManageWebhooks: true,
        canManageIntegrations: true,
      }
    case "MEMBER":
      return {
        ...permissions,
        canManageRepositories: true,
        canCreateReviews: true,
        canViewAnalytics: true,
      }
    case "VIEWER":
      return {
        ...permissions,
        canViewAnalytics: true,
      }
    default:
      return permissions
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string) {
  try {
    const [repositories, reviews, thisMonthReviews] = await Promise.all([
      prisma.repository.count({
        where: { userId }
      }),
      prisma.review.count({
        where: { userId }
      }),
      prisma.review.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ])

    // Calculate average review time and other metrics
    const reviewMetrics = await prisma.review.aggregate({
      where: { userId },
      _avg: {
        completionTime: true,
      },
      _count: {
        id: true,
      }
    })

    return {
      activeRepositories: repositories,
      totalReviews: reviews,
      reviewsThisMonth: thisMonthReviews,
      averageReviewTime: reviewMetrics._avg.completionTime || 0,
      issuesFound: 0, // TODO: Calculate from review results
      issuesFixed: 0, // TODO: Calculate from review results
      codeQualityScore: 85, // TODO: Calculate based on review metrics
    }
  } catch (error) {
    logger.error("Failed to get user stats", error as Error)
    return {
      activeRepositories: 0,
      totalReviews: 0,
      reviewsThisMonth: 0,
      averageReviewTime: 0,
      issuesFound: 0,
      issuesFixed: 0,
      codeQualityScore: 0,
    }
  }
}

/**
 * Get subscription limits based on plan
 */
export async function getSubscriptionLimits(userId: string): Promise<SubscriptionLimits> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    })

    const plan = user?.subscription?.plan || "FREE"
    
    return {
      reviews: getMaxReviews(plan),
      repositories: getMaxRepositories(plan),
      teamMembers: getMaxTeamMembers(plan),
      apiCalls: getMaxApiCalls(plan),
      webhooks: getMaxWebhooks(plan),
      customPrompts: getMaxCustomPrompts(plan),
      storageGB: getMaxStorage(plan),
    }
  } catch (error) {
    logger.error("Failed to get subscription limits", error as Error)
    return getDefaultLimits()
  }
}

/**
 * Validate and refresh GitHub tokens
 */
export async function validateAndRefreshTokens(userId: string): Promise<TokenValidation> {
  try {
    const account = await prisma.account.findFirst({
      where: { 
        userId,
        provider: "github"
      }
    })
    
    if (!account?.access_token) {
      return { isValid: false, isExpired: true }
    }
    
    // Check if token is still valid
    const response = await fetch("https://api.github.com/user", {
      headers: {
        "Authorization": `Bearer ${account.access_token}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "DevTeams-Copilot/1.0",
      }
    })
    
    if (response.ok) {
      return { 
        isValid: true, 
        isExpired: false,
        expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : undefined
      }
    }
    
    // Try to refresh the token if we have a refresh token
    if (account.refresh_token) {
      const refreshResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.GITHUB_CLIENT_ID!,
          client_secret: process.env.GITHUB_CLIENT_SECRET!,
          refresh_token: account.refresh_token,
          grant_type: "refresh_token",
        }),
      })
      
      if (refreshResponse.ok) {
        const tokenData = await refreshResponse.json()
        
        // Update the stored tokens
        await prisma.account.update({
          where: { id: account.id },
          data: {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token || account.refresh_token,
            expires_at: tokenData.expires_in 
              ? Math.floor(Date.now() / 1000) + tokenData.expires_in 
              : null,
          }
        })
        
        return { 
          isValid: true, 
          isExpired: false, 
          refreshed: true,
          expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : undefined
        }
      }
    }
    
    return { isValid: false, isExpired: true }
  } catch (error) {
    logger.error("Token validation error", error as Error)
    return { isValid: false, isExpired: true }
  }
}

/**
 * Update user's last active timestamp
 */
export async function updateLastActive(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() }
    })
  } catch (error) {
    logger.error("Failed to update last active", error as Error)
  }
}

/**
 * Handle authentication errors
 */
export function handleAuthError(error: string): AuthError {
  const errorMap: Record<string, AuthError> = {
    Configuration: {
      type: "Configuration",
      message: "There's an issue with our authentication setup. Please try again later.",
      code: "AUTH_CONFIG_ERROR"
    },
    AccessDenied: {
      type: "AccessDenied",
      message: "Access denied. Please check your permissions and try again.",
      code: "ACCESS_DENIED"
    },
    Verification: {
      type: "Verification",
      message: "Email verification failed. Please check your email or request a new verification link.",
      code: "VERIFICATION_FAILED"
    },
    InvalidCredentials: {
      type: "InvalidCredentials",
      message: "Invalid email or password. Please try again.",
      code: "INVALID_CREDENTIALS"
    },
    AccountNotLinked: {
      type: "AccountNotLinked", 
      message: "This account is not linked. Please sign in with your original provider.",
      code: "ACCOUNT_NOT_LINKED"
    },
    SessionRequired: {
      type: "SessionRequired",
      message: "You must be signed in to access this resource.",
      code: "SESSION_REQUIRED"
    }
  }

  return errorMap[error] || {
    type: "Default",
    message: "An unexpected error occurred during authentication.",
    code: "UNKNOWN_ERROR"
  }
}

// ===========================
// HELPER FUNCTIONS
// ===========================

function getDefaultPermissions(): UserPermissions {
  return {
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
}

function getDefaultLimits(): SubscriptionLimits {
  return {
    reviews: 0,
    repositories: 0,
    teamMembers: 0,
    apiCalls: 0,
    webhooks: 0,
    customPrompts: 0,
    storageGB: 0,
  }
}

function getMaxRepositories(plan: string): number {
  switch (plan) {
    case "FREE": return 3
    case "PRO": return 25
    case "TEAM": return 100
    case "ENTERPRISE": return 1000
    default: return 0
  }
}

function getMaxReviews(plan: string): number {
  switch (plan) {
    case "FREE": return 10
    case "PRO": return 500
    case "TEAM": return 2000
    case "ENTERPRISE": return 10000
    default: return 0
  }
}

function getMaxTeamMembers(plan: string): number {
  switch (plan) {
    case "FREE": return 1
    case "PRO": return 1
    case "TEAM": return 10
    case "ENTERPRISE": return 100
    default: return 0
  }
}

function getMaxApiCalls(plan: string): number {
  switch (plan) {
    case "FREE": return 100
    case "PRO": return 10000
    case "TEAM": return 50000
    case "ENTERPRISE": return 500000
    default: return 0
  }
}

function getMaxWebhooks(plan: string): number {
  switch (plan) {
    case "FREE": return 0
    case "PRO": return 5
    case "TEAM": return 25
    case "ENTERPRISE": return 100
    default: return 0
  }
}

function getMaxCustomPrompts(plan: string): number {
  switch (plan) {
    case "FREE": return 0
    case "PRO": return 5
    case "TEAM": return 25
    case "ENTERPRISE": return 100
    default: return 0
  }
}

function getMaxStorage(plan: string): number {
  switch (plan) {
    case "FREE": return 1
    case "PRO": return 10
    case "TEAM": return 100
    case "ENTERPRISE": return 1000
    default: return 0
  }
}