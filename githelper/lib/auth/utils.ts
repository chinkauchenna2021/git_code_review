import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './config'
import  prisma  from '@/lib/db/client'
import { logger } from '@/lib/utils/logger'
import { 
  ServerAuthSession, 
  TokenValidation, 
  UserPermissions, 
  UserSubscription,
  ExtendedUser 
} from '@/types/auth'

// ===========================
// SERVER-SIDE AUTH UTILITIES
// ===========================

/**
 * Validate OAuth state parameter
 */
export function validateOAuthState(receivedState: string, expectedState: string): boolean {
  if (!receivedState || !expectedState) return false
  
  try {
    // Constant time comparison to prevent timing attacks
    const receivedBuffer = Buffer.from(receivedState)
    const expectedBuffer = Buffer.from(expectedState)
    
    if (receivedBuffer.length !== expectedBuffer.length) return false
    
    let result = 0
    for (let i = 0; i < receivedBuffer.length; i++) {
      result |= receivedBuffer[i] ^ expectedBuffer[i]
    }
    
    return result === 0
  } catch (error) {
    logger.error('State validation error', error as Error)
    return false
  }
}

/**
 * Rate limiting for authentication attempts
 */
const authAttempts = new Map<string, { count: number; lastAttempt: number }>()

export function checkAuthRateLimit(identifier: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const attempts = authAttempts.get(identifier)
  
  if (!attempts) {
    authAttempts.set(identifier, { count: 1, lastAttempt: now })
    return true
  }
  
  // Reset if window has expired
  if (now - attempts.lastAttempt > windowMs) {
    authAttempts.set(identifier, { count: 1, lastAttempt: now })
    return true
  }
  
  // Check if limit exceeded
  if (attempts.count >= maxAttempts) {
    return false
  }
  
  // Increment counter
  attempts.count++
  attempts.lastAttempt = now
  
  return true
}

/**
 * Clean up expired rate limit entries
 */
export function cleanupRateLimit(): void {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000
  
  for (const [key, value] of authAttempts.entries()) {
    if (now - value.lastAttempt > windowMs) {
      authAttempts.delete(key)
    }
  }
}

// Clean up every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimit, 5 * 60 * 1000)
}
//  Get server session with enhanced error handling and typing
 
export async function getAuthSession(): Promise<ServerAuthSession | null> {
  try {
    const session = await getServerSession(authOptions)
    return session as ServerAuthSession | null
  } catch (error) {
    logger.error('Failed to get server session', error as Error)
    return null
  }
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<ServerAuthSession> {
  const session = await getAuthSession()
  
  if (!session) {
    throw new Error('Authentication required')
  }
  
  return session
}

/**
 * Get user from session with database sync
 */
export async function getSessionUser(): Promise<ExtendedUser | null> {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) return null

    // Get fresh user data from database
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscription: true,
        _count: {
          select: {
            repositories: { where: { isActive: true } },
            reviews: true
          }
        }
      }
    })

    if (!dbUser) {
      logger.warn('User not found in database', { userId: session.user.id })
      return null
    }

    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      image: dbUser.image,
      githubId: dbUser.githubId || undefined,
      githubUsername: dbUser.githubUsername || undefined,
      reviewsUsed: dbUser.reviewsUsed,
      subscription: dbUser.subscription ? {
        plan: dbUser.subscription.plan,
        status: dbUser.subscription.status,
        currentPeriodEnd: dbUser.subscription.currentPeriodEnd!
      } : undefined,
      stats: {
        activeRepositories: dbUser._count.repositories,
        totalReviews: dbUser._count.reviews
      }
    }
  } catch (error) {
    logger.error('Failed to get session user', error as Error)
    return null
  }
}

// ===========================
// TOKEN VALIDATION
// ===========================

/**
 * Validate GitHub access token
 */
export async function validateGitHubToken(token: string): Promise<TokenValidation> {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json'
      }
    })

    if (!response.ok) {
      return {
        isValid: false,
        isExpired: response.status === 401
      }
    }

    // Check token scopes
    const scopes = response.headers.get('x-oauth-scopes')?.split(', ') || []
    
    return {
      isValid: true,
      isExpired: false,
      scopes
    }
  } catch (error) {
    logger.error('Failed to validate GitHub token', error as Error)
    return {
      isValid: false,
      isExpired: true
    }
  }
}

/**
 * Check if token needs refresh
 */
export function isTokenExpired(expiresAt?: number): boolean {
  if (!expiresAt) return false
  return Date.now() > expiresAt - 300000 // 5 minutes buffer
}

// ===========================
// USER PERMISSIONS
// ===========================

/**
 * Get user permissions based on subscription
 */
export function getUserPermissions(subscription?: UserSubscription): UserPermissions {
  const plan = subscription?.plan || 'FREE'
  const status = subscription?.status || 'ACTIVE'
  
  // Base permissions
  let permissions: UserPermissions = {
    canCreateReview: status === 'ACTIVE',
    canAccessPremiumFeatures: false,
    canManageTeam: false,
    canAccessAnalytics: false,
    maxRepositories: 1,
    maxReviewsPerMonth: 50
  }

  // Plan-specific permissions
  switch (plan) {
    case 'PRO':
      permissions = {
        ...permissions,
        canAccessPremiumFeatures: true,
        canAccessAnalytics: true,
        maxRepositories: 10,
        maxReviewsPerMonth: 500
      }
      break
      
    case 'TEAM':
      permissions = {
        ...permissions,
        canAccessPremiumFeatures: true,
        canManageTeam: true,
        canAccessAnalytics: true,
        maxRepositories: -1, // Unlimited
        maxReviewsPerMonth: -1 // Unlimited
      }
      break
      
    case 'ENTERPRISE':
      permissions = {
        ...permissions,
        canAccessPremiumFeatures: true,
        canManageTeam: true,
        canAccessAnalytics: true,
        maxRepositories: -1,
        maxReviewsPerMonth: -1
      }
      break
  }

  return permissions
}

/**
 * Check if user has specific permission
 */
export async function hasPermission(permission: keyof UserPermissions): Promise<boolean> {
  try {
    const user = await getSessionUser()
    if (!user) return false

    const permissions = getUserPermissions(user.subscription as any)
    return permissions[permission] as boolean
  } catch (error) {
    logger.error('Failed to check permission', error as Error, { permission })
    return false
  }
}

/**
 * Check subscription limits
 */
export async function checkUsageLimits(userId: string): Promise<{
  withinLimits: boolean
  limits: {
    reviews: { used: number; limit: number; exceeded: boolean }
    repositories: { used: number; limit: number; exceeded: boolean }
  }
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        _count: {
          select: {
            repositories: { where: { isActive: true } }
          }
        }
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const permissions = getUserPermissions(user.subscription ? {
      plan: user.subscription.plan as any,
      status: user.subscription.status as any,
      currentPeriodEnd: user.subscription.currentPeriodEnd!,
      cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
      limits: {
        reviews: user.subscription.reviewsLimit,
        repositories: user.subscription.repositoriesLimit,
        teamMembers: user.subscription.teamMembersLimit
      },
      usage: {
        reviews: user.reviewsUsed,
        repositories: user._count.repositories,
        teamMembers: 0 // Would need to calculate
      }
    } : undefined)

    const reviewsExceeded = permissions.maxReviewsPerMonth !== -1 && 
      user.reviewsUsed >= permissions.maxReviewsPerMonth
    
    const repositoriesExceeded = permissions.maxRepositories !== -1 && 
      user._count.repositories >= permissions.maxRepositories

    return {
      withinLimits: !reviewsExceeded && !repositoriesExceeded,
      limits: {
        reviews: {
          used: user.reviewsUsed,
          limit: permissions.maxReviewsPerMonth,
          exceeded: reviewsExceeded
        },
        repositories: {
          used: user._count.repositories,
          limit: permissions.maxRepositories,
          exceeded: repositoriesExceeded
        }
      }
    }
  } catch (error) {
    logger.error('Failed to check usage limits', error as Error, { userId })
    return {
      withinLimits: false,
      limits: {
        reviews: { used: 0, limit: 0, exceeded: true },
        repositories: { used: 0, limit: 0, exceeded: true }
      }
    }
  }
}

// ===========================
// MIDDLEWARE HELPERS
// ===========================

/**
 * Check if path is public (doesn't require authentication)
 */
export function isPublicPath(pathname: string): boolean {
  const publicPaths = [
    '/',
    '/login',
    '/signup',
    '/auth/error',
    '/auth/callback',
    '/api/auth',
    '/api/webhooks',
    '/pricing',
    '/about',
    '/contact',
    '/privacy',
    '/terms'
  ]

  return publicPaths.some(path => 
    pathname === path || 
    pathname.startsWith(`${path}/`) ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/webhooks/')
  )
}

/**
 * Check if path requires authentication
 */
export function requiresAuth(pathname: string): boolean {
  const protectedPaths = [
    '/dashboard',
    '/repositories',
    '/reviews',
    '/analytics',
    '/settings',
    '/billing',
    '/team'
  ]

  return protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  )
}

/**
 * Get redirect URL after authentication
 */
export function getAuthRedirectUrl(request: NextRequest): string {
  const callbackUrl = request.nextUrl.searchParams.get('callbackUrl')
  const pathname = request.nextUrl.pathname
  
  // Use callback URL if provided and safe
  if (callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')) {
    return callbackUrl
  }
  
  // Redirect to original path if it's protected
  if (requiresAuth(pathname)) {
    return pathname + request.nextUrl.search
  }
  
  // Default to dashboard
  return '/dashboard'
}

// ===========================
// USER SESSION MANAGEMENT
// ===========================

/**
 * Update user's last active timestamp
 */
export async function updateLastActive(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() }
    })
  } catch (error) {
    logger.error('Failed to update last active', error as Error, { userId })
  }
}

/**
 * Get user's GitHub installation info
 */
export async function getUserGitHubInstallations(userId: string) {
  try {
    return await prisma.gitHubInstallation.findMany({
      where: { 
        userId,
        isActive: true
      },
      include: {
        repositories: {
          select: {
            id: true,
            name: true,
            fullName: true,
            isActive: true
          }
        }
      }
    })
  } catch (error) {
    logger.error('Failed to get GitHub installations', error as Error, { userId })
    return []
  }
}

/**
 * Sync user data with GitHub
 */
export async function syncUserWithGitHub(userId: string, githubToken: string): Promise<boolean> {
  try {
    // Fetch fresh GitHub profile data
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github+json'
      }
    })

    if (!response.ok) {
      logger.warn('Failed to fetch GitHub profile', { userId, status: response.status })
      return false
    }

    const profile = await response.json()

    // Update user with fresh GitHub data
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: profile.name || profile.login,
        image: profile.avatar_url,
        githubUsername: profile.login,
        updatedAt: new Date()
      }
    })

    logger.info('User synced with GitHub', { 
      userId, 
      githubUsername: profile.login 
    })
    
    return true
  } catch (error) {
    logger.error('Failed to sync user with GitHub', error as Error, { userId })
    return false
  }
}

// ===========================
// ERROR HANDLING
// ===========================

/**
 * Handle authentication errors
 */
export function handleAuthError(error: string): { type: string; message: string } {
  const errorMap: Record<string, string> = {
    'Configuration': 'There is a problem with the server configuration.',
    'AccessDenied': 'Access denied. Please check your permissions.',
    'Verification': 'The verification link is invalid or has expired.',
    'Default': 'An error occurred during authentication.',
    'OAuthCallback': 'Error during OAuth callback.',
    'SessionTokenError': 'Session token error. Please sign in again.',
    'CallbackRouteError': 'Callback route error.',
    'EmailSignInError': 'Email sign in error.',
    'CredentialsSignin': 'Invalid credentials.',
    'EmailCreateAccount': 'Error creating account with email.'
  }

  return {
    type: error,
    message: errorMap[error] || errorMap['Default']
  }
}

/**
 * Generate secure state parameter for OAuth
 */
export function generateOAuthState(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url')
}

