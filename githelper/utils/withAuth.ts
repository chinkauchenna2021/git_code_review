// utils/withAuth.ts - Server-side auth wrapper
import { redirect } from "next/navigation"
import { getServerSession, getServerUser } from "@/lib/auth/better-utils"
import type { AuthServerOptions, ExtendedUser } from "@/types/auth/better-auth.type"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db/client"

/**
 * Higher-order function for protecting pages with authentication
 */
export function withAuth<T extends Record<string, any>>(
  handler: (props: T & { user: ExtendedUser }) => Promise<any> | any,
  options: AuthServerOptions = {}
) {
  return async (props: T) => {
    const session = await getServerSession()
    
    if (!session && options.required !== false) {
      redirect(options.redirectTo || "/auth/signin")
    }
    
    if (session) {
      const user = await getServerUser()
      if (user) {
        return handler({ ...props, user })
      }
    }
    
    if (options.required !== false) {
      redirect(options.redirectTo || "/auth/signin")
    }
    
    return handler(props as any)
  }
}

/**
 * HOC for requiring specific permissions
 */
export function withPermissions<T extends Record<string, any>>(
  handler: (props: T & { user: ExtendedUser }) => Promise<any> | any,
  requiredPermissions: string[],
  options: AuthServerOptions = {}
) {
  return withAuth(async (props: T & { user: ExtendedUser }) => {
    const { user } = props
    
    if (!user.permissions) {
      redirect("/unauthorized")
    }
    
    const hasPermissions = requiredPermissions.every(
      permission => user.permissions?.[permission as keyof typeof user.permissions]
    )
    
    if (!hasPermissions) {
      redirect("/unauthorized")
    }
    
    return handler(props)
  }, { ...options, required: true })
}

/**
 * HOC for requiring subscription
 */
export function withSubscription<T extends Record<string, any>>(
  handler: (props: T & { user: ExtendedUser }) => Promise<any> | any,
  requiredPlan?: string,
  options: AuthServerOptions = {}
) {
  return withAuth(async (props: T & { user: ExtendedUser }) => {
    const { user } = props
    
    if (!user.subscription || user.subscription.status !== "ACTIVE") {
      redirect("/billing")
    }
    
    if (requiredPlan && user.subscription.plan !== requiredPlan) {
      redirect("/billing/upgrade")
    }
    
    return handler(props)
  }, { ...options, required: true })
}


