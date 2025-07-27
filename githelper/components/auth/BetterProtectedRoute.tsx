"use client"

import { useAuth } from "@/lib/auth/better-hook"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import type { ProtectedRouteProps } from "@/types/auth/better-auth.type"

export function ProtectedRoute({
  children,
  fallback,
  requireAuth = true,
  requireSubscription = false,
  requiredPlan,
  requiredRole,
  requiredPermissions = [],
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, permissions, subscription, activeOrganization } = useAuth()

  if (isLoading) {
    return fallback || <LoadingSpinner className="h-screen" />
  }

  if (requireAuth && !isAuthenticated) {
    return fallback || <div>Access denied</div>
  }

  if (requireSubscription && (!subscription || subscription.status !== "ACTIVE")) {
    return fallback || <div>Subscription required</div>
  }

  if (requiredPlan && subscription?.plan !== requiredPlan) {
    return fallback || <div>Plan upgrade required</div>
  }

  if (requiredRole && (!activeOrganization || activeOrganization.role !== requiredRole)) {
    return fallback || <div>Insufficient role permissions</div>
  }

  if (requiredPermissions.length > 0 && permissions) {
    const hasPermissions = requiredPermissions.every(permission => permissions[permission])
    if (!hasPermissions) {
      return fallback || <div>Insufficient permissions</div>
    }
  }

  return <>{children}</>
}
