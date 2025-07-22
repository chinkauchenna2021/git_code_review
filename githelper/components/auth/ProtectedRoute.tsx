'use client'

import { ReactNode } from 'react'
import { useProtectedRoute } from '@/lib/hooks/use-auth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { AuthErrorBoundary } from './AuthErrorBoundary'

interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
  requireSubscription?: boolean
  requiredPlan?: 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE'
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  fallback,
  requireSubscription,
  requiredPlan,
  redirectTo
}: ProtectedRouteProps) {
  const { isAuthorized, isLoading } = useProtectedRoute({
    requireSubscription,
    requiredPlan,
    redirectTo
  })

  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthorized) {
    return null // Redirect is handled by hook
  }

  return (
    <AuthErrorBoundary>
      {children}
    </AuthErrorBoundary>
  )
}
