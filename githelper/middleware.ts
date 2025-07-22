import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isPublicPath, requiresAuth, getAuthRedirectUrl, checkAuthRateLimit } from '@/lib/auth/utils'
import { logger } from '@/lib/utils/logger'

// ===========================
// MIDDLEWARE CONFIGURATION
// ===========================

export default withAuth(
  async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    //@ts-ignore
    const token = request.nextauth?.token
    //@ts-ignore
    const session = request.nextauth
    
    // Get client IP for rate limiting
    //@ts-ignore
    const clientIP = request.ip || 
      request.headers.get('x-forwarded-for')?.split(',')[0] || 
      request.headers.get('x-real-ip') || 
      'unknown'

    try {
      // ===========================
      // RATE LIMITING
      // ===========================
      
      // Apply rate limiting to auth endpoints
      if (pathname.startsWith('/api/auth/') || pathname.startsWith('/auth/')) {
        if (!checkAuthRateLimit(clientIP, 10, 15 * 60 * 1000)) {
          logger.warn('Rate limit exceeded for auth endpoint', {
            ip: clientIP,
            pathname,
            userAgent: request.headers.get('user-agent')
          })
          
          return new NextResponse('Too Many Requests', { 
            status: 429,
            headers: {
              'Retry-After': '900', // 15 minutes
              'X-RateLimit-Limit': '10',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': Math.ceil(Date.now() / 1000 + 900).toString()
            }
          })
        }
      }

      // ===========================
      // PUBLIC PATHS
      // ===========================
      
      if (isPublicPath(pathname)) {
        // Redirect authenticated users away from auth pages
        if (token && (pathname === '/login' || pathname === '/signup')) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        
        return NextResponse.next()
      }

      // ===========================
      // PROTECTED PATHS
      // ===========================
      
      if (requiresAuth(pathname)) {
        // User not authenticated
        if (!token) {
          const loginUrl = new URL('/login', request.url)
          loginUrl.searchParams.set('callbackUrl', pathname + request.nextUrl.search)
          
          logger.info('Redirecting unauthenticated user to login', {
            pathname,
            ip: clientIP
          })
          
          return NextResponse.redirect(loginUrl)
        }

        // ===========================
        // SUBSCRIPTION CHECKS
        // ===========================
        
        // Check if premium features require subscription
        const premiumPaths = ['/analytics', '/team', '/integrations']
        if (premiumPaths.some(path => pathname.startsWith(path))) {
          const userPlan = (token as any)?.user?.subscription?.plan || 'FREE'
          
          if (userPlan === 'FREE') {
            const upgradeUrl = new URL('/pricing', request.url)
            upgradeUrl.searchParams.set('upgrade', 'required')
            upgradeUrl.searchParams.set('feature', pathname.split('/')[1])
            
            logger.info('Redirecting free user from premium feature', {
              pathname,
              userId: token.sub,
              plan: userPlan
            })
            
            return NextResponse.redirect(upgradeUrl)
          }
        }

        // ===========================
        // TEAM PATHS AUTHORIZATION
        // ===========================
        
        if (pathname.startsWith('/team/')) {
          const userPlan = (token as any)?.user?.subscription?.plan || 'FREE'
          
          if (!['TEAM', 'ENTERPRISE'].includes(userPlan)) {
            return NextResponse.redirect(new URL('/pricing', request.url))
          }
        }

        // ===========================
        // ADMIN PATHS AUTHORIZATION
        // ===========================
        
        if (pathname.startsWith('/admin/')) {
          const userEmail = token.email
          const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
          
          if (!userEmail || !adminEmails.includes(userEmail)) {
            logger.warn('Unauthorized admin access attempt', {
              pathname,
              userId: token.sub,
              email: userEmail,
              ip: clientIP
            })
            
            return NextResponse.redirect(new URL('/dashboard', request.url))
          }
        }
      }

      // ===========================
      // API ROUTES PROTECTION
      // ===========================
      
      if (pathname.startsWith('/api/')) {
        // Skip auth routes and webhooks
        if (pathname.startsWith('/api/auth/') || 
            pathname.startsWith('/api/webhooks/') ||
            pathname === '/api/health') {
          return NextResponse.next()
        }

        // Require authentication for API routes
        if (!token) {
          return new NextResponse('Unauthorized', { 
            status: 401,
            headers: {
              'Content-Type': 'application/json'
            }
          })
        }

        // Add user context to API requests
        const response = NextResponse.next()
        response.headers.set('x-user-id', token.sub || '')
        response.headers.set('x-user-email', token.email || '')
        
        return response
      }

      // ===========================
      // SUCCESS RESPONSE
      // ===========================
      
      const response = NextResponse.next()
      
      // Add security headers
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
      response.headers.set('X-XSS-Protection', '1; mode=block')
      
      // Add user context for authenticated requests
      if (token) {
        response.headers.set('x-user-authenticated', 'true')
        response.headers.set('x-user-id', token.sub || '')
      }

      // Log successful access
      if (token) {
        logger.debug('Authenticated request processed', {
          pathname,
          userId: token.sub,
          ip: clientIP
        })
      }

      return response

    } catch (error) {
      logger.error('Middleware error', error as Error, {
        pathname,
        userId: token?.sub,
        ip: clientIP
      })
      
      // Return error response for API routes
      if (pathname.startsWith('/api/')) {
        return new NextResponse('Internal Server Error', { status: 500 })
      }
      
      // Redirect to error page for web routes
      return NextResponse.redirect(new URL('/auth/error', request.url))
    }
  },
  {
    callbacks: {
      // Only run middleware on protected routes
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Always allow public paths
        if (isPublicPath(pathname)) {
          return true
        }
        
        // For protected paths, check if user has token
        if (requiresAuth(pathname)) {
          return !!token
        }
        
        // For API routes (except auth/webhooks), require token
        if (pathname.startsWith('/api/') && 
            !pathname.startsWith('/api/auth/') && 
            !pathname.startsWith('/api/webhooks/') &&
            pathname !== '/api/health') {
          return !!token
        }
        
        return true
      }
    },
    pages: {
      signIn: '/login',
      error: '/auth/error'
    }
  }
)

// ===========================
// MIDDLEWARE MATCHER
// ===========================

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}