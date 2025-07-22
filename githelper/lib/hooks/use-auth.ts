import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { UseAuthReturn, ExtendedUser, UserPermissions } from '@/types/auth'
import { getUserPermissions } from '@/lib/auth/utils'
import { logger } from '@/lib/utils/logger'

/**
 * Enhanced authentication hook with extended functionality
 */
export function useAuth(requireAuth: boolean = false): UseAuthReturn {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isInitialized, setIsInitialized] = useState(false)

  // Redirect to login if authentication is required
  useEffect(() => {
    if (requireAuth && status === 'unauthenticated' && isInitialized) {
      router.push('/login')
    }
    
    if (status !== 'loading') {
      setIsInitialized(true)
    }
  }, [requireAuth, status, router, isInitialized])

  // Enhanced sign in with options
  const handleSignIn = useCallback(async (options?: {
    callbackUrl?: string
    provider?: string
    redirect?: boolean
  }) => {
    try {
      const callbackUrl = options?.callbackUrl || window.location.pathname
      
      await signIn(options?.provider || 'github', {
        callbackUrl,
        redirect: options?.redirect !== false
      })
    } catch (error) {
      logger.error('Sign in error', error as Error)
    }
  }, [])

  // Enhanced sign out with cleanup
  const handleSignOut = useCallback(async (options?: {
    callbackUrl?: string
    redirect?: boolean
  }) => {
    try {
      await signOut({
        callbackUrl: options?.callbackUrl || '/',
        redirect: options?.redirect !== false
      })
    } catch (error) {
      logger.error('Sign out error', error as Error)
    }
  }, [])

  // Update session data
  const updateSession = useCallback(async () => {
    try {
      await update()
    } catch (error) {
      logger.error('Session update error', error as Error)
    }
  }, [update])

  return {
    user: session?.user as ExtendedUser || null,
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    githubToken: session?.githubAccessToken,
    githubUsername: session?.githubUsername,
    signIn: handleSignIn,
    signOut: handleSignOut,
    update: updateSession
  }
}

/**
 * Hook for user permissions based on subscription
 */
export function usePermissions(): {
  permissions: UserPermissions | null
  hasPermission: (permission: keyof UserPermissions) => boolean
  isLoading: boolean
} {
  const { user, isLoading } = useAuth()
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)

  useEffect(() => {
    if (user && !isLoading) {
      const userPermissions = getUserPermissions(user.subscription as any)
      setPermissions(userPermissions)
    } else {
      setPermissions(null)
    }
  }, [user, isLoading])

  const hasPermission = useCallback((permission: keyof UserPermissions): boolean => {
    if (!permissions) return false
    return permissions[permission] as boolean
  }, [permissions])

  return {
    permissions,
    hasPermission,
    isLoading: isLoading || !permissions
  }
}

/**
 * Hook for subscription status and limits
 */
export function useSubscription(): {
  subscription: ExtendedUser['subscription'] | null
  usage: {
    reviews: { used: number; limit: number; percentage: number }
    repositories: { used: number; limit: number; percentage: number }
  } | null
  isAtLimit: boolean
  isLoading: boolean
  refreshUsage: () => Promise<void>
} {
  const { user, isLoading, update } = useAuth()
  const [usage, setUsage] = useState<any>(null)

  const refreshUsage = useCallback(async () => {
    try {
      const response = await fetch('/api/user/usage')
      if (response.ok) {
        const data = await response.json()
        setUsage(data.usage)
        await update() // Refresh session to get latest data
      }
    } catch (error) {
      logger.error('Failed to refresh usage', error as Error)
    }
  }, [update])

  useEffect(() => {
    if (user && !isLoading) {
      refreshUsage()
    }
  }, [user, isLoading, refreshUsage])

  // Calculate usage percentages
  const calculatedUsage = usage ? {
    reviews: {
      used: user?.reviewsUsed || 0,
      limit: usage.reviewsLimit || 50,
      percentage: usage.reviewsLimit > 0 ? 
        Math.min(100, ((user?.reviewsUsed || 0) / usage.reviewsLimit) * 100) : 0
    },
    repositories: {
      used: user?.stats?.activeRepositories || 0,
      limit: usage.repositoriesLimit || 1,
      percentage: usage.repositoriesLimit > 0 ? 
        Math.min(100, ((user?.stats?.activeRepositories || 0) / usage.repositoriesLimit) * 100) : 0
    }
  } : null

  const isAtLimit = calculatedUsage ? 
    calculatedUsage.reviews.percentage >= 100 || calculatedUsage.repositories.percentage >= 100 :
    false

  return {
    subscription: user?.subscription || null,
    usage: calculatedUsage,
    isAtLimit,
    isLoading: isLoading || !usage,
    refreshUsage
  }
}

/**
 * Hook for GitHub integration status
 */
export function useGitHubIntegration(): {
  hasGitHubToken: boolean
  githubUsername: string | null
  installations: any[]
  isLoading: boolean
  refreshInstallations: () => Promise<void>
} {
  const { user, githubToken, githubUsername, isLoading } = useAuth()
  const [installations, setInstallations] = useState<any[]>([])
  const [installationsLoading, setInstallationsLoading] = useState(false)

  const refreshInstallations = useCallback(async () => {
    if (!user || !githubToken) return

    setInstallationsLoading(true)
    try {
      const response = await fetch('/api/github/installations')
      if (response.ok) {
        const data = await response.json()
        setInstallations(data.installations || [])
      }
    } catch (error) {
      logger.error('Failed to refresh GitHub installations', error as Error)
    } finally {
      setInstallationsLoading(false)
    }
  }, [user, githubToken])

  useEffect(() => {
    if (user && githubToken && !isLoading) {
      refreshInstallations()
    }
  }, [user, githubToken, isLoading, refreshInstallations])

  return {
    hasGitHubToken: !!githubToken,
    githubUsername: githubUsername as any,
    installations,
    isLoading: isLoading || installationsLoading,
    refreshInstallations
  }
}

/**
 * Hook for authentication form state management
 */
export function useAuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const signInWithGitHub = useCallback(async (options?: { callbackUrl?: string }) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn('github', {
        callbackUrl: options?.callbackUrl || '/dashboard',
        redirect: false
      })

      if (result?.error) {
        setError('Authentication failed. Please try again.')
        logger.error('GitHub sign in error', new Error(result.error))
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
      logger.error('GitHub sign in error', error as Error)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isLoading,
    error,
    signInWithGitHub,
    clearError
  }
}

/**
 * Hook for protected route wrapper
 */
export function useProtectedRoute(options?: {
  requireSubscription?: boolean
  requiredPlan?: 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE'
  redirectTo?: string
}) {
  const { user, isLoading, status } = useAuth()
  const { hasPermission } = usePermissions()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    if (isLoading || status === 'loading') {
      return
    }

    // Not authenticated
    if (!user) {
      const redirectUrl = options?.redirectTo || '/login'
      router.push(redirectUrl)
      setIsAuthorized(false)
      return
    }

    // Check subscription requirements
    if (options?.requireSubscription) {
      const userPlan = user.subscription?.plan || 'FREE'
      const requiredPlan = options.requiredPlan || 'PRO'
      
      const planHierarchy = ['FREE', 'PRO', 'TEAM', 'ENTERPRISE']
      const userPlanIndex = planHierarchy.indexOf(userPlan)
      const requiredPlanIndex = planHierarchy.indexOf(requiredPlan)
      
      if (userPlanIndex < requiredPlanIndex) {
        router.push('/pricing')
        setIsAuthorized(false)
        return
      }
    }

    setIsAuthorized(true)
  }, [user, isLoading, status, router, options?.requireSubscription, options?.requiredPlan, options?.redirectTo])

  return {
    isAuthorized,
    isLoading: isLoading || isAuthorized === null,
    user
  }
}

/**
 * Hook for session management and automatic refresh
 */
export function useSessionManagement() {
  const { data: session, status, update } = useSession()
  const [lastActivity, setLastActivity] = useState(Date.now())

  // Update last activity on user interaction
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now())
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true)
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true)
      })
    }
  }, [])

  // Auto-refresh session periodically
  useEffect(() => {
    if (status === 'authenticated') {
      const interval = setInterval(() => {
        // Only refresh if user has been active in the last 30 minutes
        if (Date.now() - lastActivity < 30 * 60 * 1000) {
          update()
        }
      }, 5 * 60 * 1000) // Check every 5 minutes

      return () => clearInterval(interval)
    }
  }, [status, update, lastActivity])

  return {
    session,
    status,
    lastActivity: new Date(lastActivity)
  }
}