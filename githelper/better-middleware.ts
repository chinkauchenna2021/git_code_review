// middleware.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/config"
import type { AuthMiddlewareConfig } from "@/types/auth/better-auth.type"
import { getServerSession, getServerUser } from "@/lib/auth/better-utils"

const config: AuthMiddlewareConfig = {
  publicPaths: [
    "/",
    "/auth/signin",
    "/auth/signup", 
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-email",
    "/auth/error",
    "/pricing",
    "/docs",
    "/api/webhooks",
    "/api/health",
  ],
  authPaths: [
    "/auth/signin",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
  ],
  adminPaths: [
    "/admin",
  ],
  afterSignInRedirect: "/dashboard",
  afterSignOutRedirect: "/",
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files, API routes (except auth), and public paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/api") ||
    config.publicPaths.some(path => pathname === path || pathname.startsWith(path + "/"))
  ) {
    return NextResponse.next()
  }

  try {
    // Get session using Better Auth
    const session = await getServerSession()
    const isAuthenticated = !!session?.user
    const isAuthPath = config.authPaths.some(path => pathname.startsWith(path))
    const isAdminPath = config.adminPaths.some(path => pathname.startsWith(path))

    // Redirect authenticated users away from auth pages
    if (isAuthenticated && isAuthPath) {
      const callbackUrl = request.nextUrl.searchParams.get("callbackUrl")
      const redirectUrl = callbackUrl || config.afterSignInRedirect
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    // Redirect unauthenticated users to sign in
    if (!isAuthenticated && !isAuthPath) {
      const signInUrl = new URL("/auth/signin", request.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Check admin access
    if (isAdminPath && isAuthenticated) {
      // Add admin role check here if needed
      const user = session.user as any
      if (!user.isAdmin) {
        return NextResponse.redirect(new URL("/unauthorized", request.url))
      }
    }

    // Add security headers
    const response = NextResponse.next()
    
    // Security headers
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://api.github.com https://*.vercel.app",
        "frame-ancestors 'none'",
      ].join("; ")
    )

    // Add session info to headers for server components
    if (session?.user) {
      response.headers.set("X-User-Id", session.user.id)
      response.headers.set("X-User-Email", session.user.email || "")
    }

    return response
  } catch (error) {
    console.error("Middleware error:", error)
    
    // On error, redirect to sign in if not on public path
    if (!config.publicPaths.some(path => pathname.startsWith(path))) {
      const signInUrl = new URL("/auth/signin", request.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      signInUrl.searchParams.set("error", "SessionError")
      return NextResponse.redirect(signInUrl)
    }
    
    return NextResponse.next()
  }
}

export const configs = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
