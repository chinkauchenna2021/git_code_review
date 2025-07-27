// lib/auth/hooks.ts
"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthSession, signIn, signOut, organization } from "../db/better-client"
import { getUserPermissions, getSubscriptionLimits } from "./better-utils"
import { logger } from "@/lib/utils/logger"
import type {
  UseAuthReturn,
  ExtendedUser,
  UserPermissions,
  OrganizationMembership,
  SignInOptions,
  SignOutOptions,
  SignUpData,
  SubscriptionLimits,
} from "@/types/auth/better-auth.type"

/**
 * Enhanced authentication hook with full TypeScript support
 */
export function useAuth(requireAuth: boolean = false): UseAuthReturn | any {
  const { data: session, isPending, error } = useAuthSession()
  const router = useRouter()
  
  const [isInitialized, setIsInitialized] = useState(false)
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [organizations, setOrganizations] = useState<OrganizationMembership[]>([])
  const [activeOrganization, setActiveOrganization] = useState<OrganizationMembership | null>(null)

  // Initialize auth state
  useEffect(() => {
    if (!isPending) {
      setIsInitialized(true)
    }
  }, [isPending])

  // Redirect to login if authentication is required
  useEffect(() => {
    if (requireAuth && !session && isInitialized && !isPending) {
      router.push("/auth/signin")
    }
  }, [requireAuth, session, isInitialized, isPending, router])

  // Load user permissions and organizations
  useEffect(() => {
    if (session?.user) {
      loadUserData(session.user.id)
    } else {
      setPermissions(null)
      setOrganizations([])
      setActiveOrganization(null)
    }
  }, [session?.user])

  const loadUserData = useCallback(async (userId: string) => {
    try {
      const [userPermissions, userOrganizations] = await Promise.all([
        getUserPermissions(userId),
        organization.listUserOrganizations(),
      ])

      setPermissions(userPermissions)
      setOrganizations(userOrganizations.data || [])

      // Set active organization from session or first organization
      const activeOrgId = session?.activeOrganization?.id
      const activeOrg = userOrganizations.data?.find((org: { id: any }) => org.id === activeOrgId) || userOrganizations.data?.[0]
      setActiveOrganization(activeOrg || null)
    } catch (error) {
      logger.error("Failed to load user data", error as Error)
    }
  }, [session?.activeOrganization?.id])

  const handleSignIn = useCallback(async (provider: string = "github", options: SignInOptions = {}) => {
    try {
      await signIn.social({
        provider: provider as "github",
        callbackURL: options.callbackUrl || window.location.href,
      })
    } catch (error) {
      logger.error("Sign in error", error as Error)
      throw error
    }
  }, [])

  const handleSignOut = useCallback(async (options: SignOutOptions = {}) => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            setPermissions(null)
            setOrganizations([])
            setActiveOrganization(null)
            router.push(options.callbackUrl || "/")
          },
        },
      })
    } catch (error) {
      logger.error("Sign out error", error as Error)
      throw error
    }
  }, [router])

  const handleSignUp = useCallback(async (data: SignUpData) => {
    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password!,
        name: data.name,
      })
      
      if (result.error) {
        throw new Error(result.error.message)
      }
    } catch (error) {
      logger.error("Sign up error", error as Error)
      throw error
    }
  }, [])

  const updateUser = useCallback(async (data: Partial<ExtendedUser>) => {
    try {
      // Implement user update logic
      // This would typically call an API endpoint to update user data
      const response = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update user")
      }

      // Refresh session to get updated data
      await refreshSession()
    } catch (error) {
      logger.error("Update user error", error as Error)
      throw error
    }
  }, [])

  const switchOrganization = useCallback(async (organizationId: string) => {
    try {
      const org = organizations.find(o => o.id === organizationId)
      if (!org) {
        throw new Error("Organization not found")
      }

      setActiveOrganization(org)
      
      // Update session with active organization
      await fetch("/api/auth/switch-organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      })

      // Reload permissions for the new organization
      await loadUserData(session!.user.id)
    } catch (error) {
      logger.error("Switch organization error", error as Error)
      throw error
    }
  }, [organizations, session, loadUserData])

  const refreshSession = useCallback(async () => {
    try {
      // Force refresh the session
      window.location.reload()
    } catch (error) {
      logger.error("Refresh session error", error as Error)
    }
  }, [])

  // Determine authentication status
  const status = isPending ? "loading" : session ? "authenticated" : "unauthenticated"
  const isAuthenticated = !!session && !error
  const isLoading = isPending || !isInitialized

  return {
    user: (session?.user as ExtendedUser) || null,
    session: session || null,
    status,
    isAuthenticated,
    isLoading,
    organizations,
    activeOrganization,
    permissions,
    subscription: session?.user?.subscription || null,
    githubToken: session?.githubAccessToken,
    githubUsername: (session?.user as ExtendedUser)?.githubUsername,
    signIn: handleSignIn,
    signOut: handleSignOut,
    signUp: handleSignUp,
    updateUser,
    switchOrganization,
    refreshSession,
  }
}

/**
 * Hook for organization management
 */
export function useOrganizations() {
  const { organizations, activeOrganization, switchOrganization } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const createOrganization = useCallback(async (data: { name: string; slug?: string }) => {
    setIsLoading(true)
    try {
      const result = await organization.create({
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
      })

      if (result.error) {
        throw new Error(result.error.message)
      }

      return result.data
    } catch (error) {
      logger.error("Create organization error", error as Error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const inviteMember = useCallback(async (email: string, role: string) => {
    if (!activeOrganization) {
      throw new Error("No active organization")
    }

    setIsLoading(true)
    try {
      const result = await organization.inviteMember({
        organizationId: activeOrganization.id,
        email,
        role,
      })

      if (result.error) {
        throw new Error(result.error.message)
      }

      return result.data
    } catch (error) {
      logger.error("Invite member error", error as Error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [activeOrganization])

  const removeMember = useCallback(async (userId: string) => {
    if (!activeOrganization) {
      throw new Error("No active organization")
    }

    setIsLoading(true)
    try {
      const result = await organization.removeMember({
        organizationId: activeOrganization.id,
        userId,
      })

      if (result.error) {
        throw new Error(result.error.message)
      }

      return result.data
    } catch (error) {
      logger.error("Remove member error", error as Error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [activeOrganization])

  return {
    organizations,
    activeOrganization,
    isLoading,
    switchOrganization,
    createOrganization,
    inviteMember,
    removeMember,
  }
}

/**
 * Hook for subscription and billing
 */
export function useSubscription() {
  const { user, permissions } = useAuth()
  const [subscription, setSubscription] = useState(user?.subscription || null)
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user?.subscription) {
      setSubscription(user.subscription)
      loadSubscriptionLimits()
    }
  }, [user?.subscription])

  const loadSubscriptionLimits = useCallback(async () => {
    if (!user) return

    try {
      const subscriptionLimits = await getSubscriptionLimits(user.id)
      setLimits(subscriptionLimits)
    } catch (error) {
      logger.error("Failed to load subscription limits", error as Error)
    }
  }, [user])

  const upgradePlan = useCallback(async (planId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/billing/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      })

      if (!response.ok) {
        throw new Error("Failed to upgrade plan")
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      logger.error("Upgrade plan error", error as Error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const cancelSubscription = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/billing/cancel", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to cancel subscription")
      }

      // Refresh user data
      window.location.reload()
    } catch (error) {
      logger.error("Cancel subscription error", error as Error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    subscription,
    limits,
    permissions,
    isLoading,
    upgradePlan,
    cancelSubscription,
  }
}

/**
 * Hook for requiring authentication
 */
export function useRequireAuth(options: {
  redirectTo?: string
  requireSubscription?: boolean
  requiredPlan?: string
} = {}) {
  const { isAuthenticated, isLoading, user, subscription } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(options.redirectTo || "/auth/signin")
    }

    if (options.requireSubscription && user && !subscription) {
      router.push("/billing")
    }

    if (options.requiredPlan && subscription && subscription.plan !== options.requiredPlan) {
      router.push("/billing/upgrade")
    }
  }, [isLoading, isAuthenticated, user, subscription, router, options])

  return {
    isAuthenticated,
    isLoading,
    user,
    subscription,
  }
}