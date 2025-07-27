// lib/auth/current-user.ts
import { cookies } from "next/headers"
import { prisma } from "@/lib/db/client"
import { logger } from "@/lib/utils/logger"
import type { ExtendedUser } from "@/types/auth/better-auth.type"

/**
 * Get the current authenticated user from session
 * This is a fallback method that works when Better-Auth API has issues
 */
export async function getCurrentUser(): Promise<ExtendedUser | null> {
  try {
    const cookieStore = await cookies()
    
    // Try different possible session cookie names
    const sessionToken = 
      cookieStore.get('better-auth.session-token')?.value ||
      cookieStore.get('session-token')?.value ||
      cookieStore.get('__Secure-authjs.session-token')?.value ||
      cookieStore.get('authjs.session-token')?.value

    if (!sessionToken) {
      return null
    }

    // Find session in database
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
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
        }
      }
    })

    // Check if session exists and is not expired
    if (!session || session.expires < new Date()) {
      // Clean up expired session
      if (session) {
        await prisma.session.delete({
          where: { id: session.id }
        })
      }
      return null
    }

    const user = session.user

    // Get additional user data
    const [permissions, stats] = await Promise.all([
      getUserPermissions(user.id),
      getUserStats(user.id),
    ])

    // Transform organization memberships
    const organizations = user.organizationMemberships.map(membership => ({
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
    }))

    return {
      ...user,
      permissions,
      stats,
      organizations,
    } as any

  } catch (error) {
    logger.error("Failed to get current user", error as Error)
    return null
  }
}

/**
 * Get current user and require authentication
 * Throws error if user is not authenticated
 */
export async function requireCurrentUser(): Promise<ExtendedUser> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error("Authentication required")
  }
  
  return user
}

/**
 * Get current user ID from session cookie
 * Lightweight version for when you only need the user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = 
      cookieStore.get('better-auth.session-token')?.value ||
      cookieStore.get('session-token')?.value

    if (!sessionToken) {
      return null
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
      select: {
        userId: true,
        expires: true,
      }
    })

    if (!session || session.expires < new Date()) {
      return null
    }

    return session.userId
  } catch (error) {
    logger.error("Failed to get current user ID", error as Error)
    return null
  }
}

/**
 * Check if current user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const userId = await getCurrentUserId()
  return !!userId
}

/**
 * Get current user's subscription status
 */
export async function getCurrentUserSubscription() {
  const user = await getCurrentUser()
  return user?.subscription || null
}

/**
 * Get current user's permissions
 */
export async function getCurrentUserPermissions() {
  const user = await getCurrentUser()
  return user?.permissions || null
}

/**
 * Get current user's active organization
 */
export async function getCurrentUserActiveOrganization() {
  const user = await getCurrentUser()
  if (!user?.organizations?.length) {
    return null
  }
  
  // Return first organization or implement logic to get active one
  return user.organizations[0] || null
}

// Helper functions (these should be imported from your utils)
async function getUserPermissions(userId: string) {
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
    const plan = subscription?.plan || "FREE"
    
    // Get organization permissions
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

async function getUserStats(userId: string) {
  try {
    const [repositories, reviews, thisMonthReviews] = await Promise.all([
      prisma.repository.count({
        where: { ownerId: userId }
      }),
      prisma.review.count({
        where: { ownerId: userId }
      }),
      prisma.review.count({
        where: {
          ownerId: userId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ])

    return {
      activeRepositories: repositories,
      totalReviews: reviews,
      reviewsThisMonth: thisMonthReviews,
      averageReviewTime: 0,
      issuesFound: 0,
      issuesFixed: 0,
      codeQualityScore: 85,
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

function getOrganizationPermissions(role: string) {
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
    default:
      return permissions
  }
}

function getDefaultPermissions() {
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