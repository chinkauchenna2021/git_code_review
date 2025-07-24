// // middleware.ts - Fixed version
// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'
// import { getToken } from 'next-auth/jwt'

import { NextRequest, NextResponse } from "next/server";

// // ===========================
// // UTILITY FUNCTIONS
// // ===========================

// const publicPaths = [
//   '/',
//   '/login',
//   '/signup',
//   '/auth/signin',
//   '/auth/error',
//   '/auth/callback',
//   '/api/auth',
//   '/api/webhooks',
//   '/pricing',
//   '/about',
//   '/contact',
//   '/privacy',
//   '/terms'
// ]

// const protectedPaths = [
//   '/dashboard',
//   '/repositories',
//   '/reviews',
//   '/analytics',
//   '/settings',
//   '/billing',
//   '/team'
// ]

// function isPublicPath(pathname: string): boolean {
//   return publicPaths.some(path => 
//     pathname === path || 
//     pathname.startsWith(`${path}/`) ||
//     pathname.startsWith('/api/auth/') ||
//     pathname.startsWith('/api/webhooks/')
//   )
// }

// function requiresAuth(pathname: string): boolean {
//   return protectedPaths.some(path => 
//     pathname === path || pathname.startsWith(`${path}/`)
//   )
// }

// // Rate limiting store
// const rateLimit = new Map<string, { count: number; lastAttempt: number }>()

// function checkRateLimit(identifier: string, maxAttempts = 10, windowMs = 15 * 60 * 1000): boolean {
//   const now = Date.now()
//   const attempts = rateLimit.get(identifier)
  
//   if (!attempts) {
//     rateLimit.set(identifier, { count: 1, lastAttempt: now })
//     return true
//   }
  
//   // Reset if window has expired
//   if (now - attempts.lastAttempt > windowMs) {
//     rateLimit.set(identifier, { count: 1, lastAttempt: now })
//     return true
//   }
  
//   // Check if limit exceeded
//   if (attempts.count >= maxAttempts) {
//     return false
//   }
  
//   // Increment counter
//   attempts.count++
//   attempts.lastAttempt = now
  
//   return true
// }

// // ===========================
// // MAIN MIDDLEWARE FUNCTION
// // ===========================

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl
  
//   // Get client IP for rate limiting
  
//   //@ts-ignore
//   const clientIP = request.ip || 
//     request.headers.get('x-forwarded-for')?.split(',')[0] || 
//     request.headers.get('x-real-ip') || 
//     'unknown'

//   try {
//     // ===========================
//     // RATE LIMITING
//     // ===========================
    
//     // Apply rate limiting to auth endpoints
//     if (pathname.startsWith('/api/auth/') || pathname.startsWith('/auth/')) {
//       if (!checkRateLimit(clientIP, 10, 15 * 60 * 1000)) {
//         console.warn('Rate limit exceeded for auth endpoint', {
//           ip: clientIP,
//           pathname
//         })
        
//         return new NextResponse('Too Many Requests', { 
//           status: 429,
//           headers: {
//             'Retry-After': '900',
//             'X-RateLimit-Limit': '10',
//             'X-RateLimit-Remaining': '0',
//             'X-RateLimit-Reset': Math.ceil(Date.now() / 1000 + 900).toString()
//           }
//         })
//       }
//     }

//     // ===========================
//     // PUBLIC PATHS - Allow all
//     // ===========================
    
//     if (isPublicPath(pathname)) {
//       // Get token to check if user is already authenticated
//       const token = await getToken({ 
//         req: request, 
//         secret: process.env.NEXTAUTH_SECRET,
//         secureCookie: process.env.NODE_ENV === 'production'
//       })
      
//       // Redirect authenticated users away from auth pages
//       if (token && (pathname === '/login' || pathname === '/signup' || pathname === '/auth/signin')) {
//         return NextResponse.redirect(new URL('/dashboard', request.url))
//       }
      
//       return NextResponse.next()
//     }

//     // ===========================
//     // GET AUTH TOKEN
//     // ===========================
    
//     const token = await getToken({ 
//       req: request, 
//       secret: process.env.NEXTAUTH_SECRET,
//       secureCookie: process.env.NODE_ENV === 'production'
//     })

//     // ===========================
//     // PROTECTED PATHS
//     // ===========================
    
//     if (requiresAuth(pathname)) {
//       // User not authenticated - redirect to login
//       if (!token) {
//         const loginUrl = new URL('/login', request.url)
//         loginUrl.searchParams.set('callbackUrl', pathname + request.nextUrl.search)
        
//         console.info('Redirecting unauthenticated user to login', {
//           pathname,
//           ip: clientIP
//         })
        
//         return NextResponse.redirect(loginUrl)
//       }
//     }

//     // ===========================
//     // API ROUTES
//     // ===========================
    
//     if (pathname.startsWith('/api/')) {
//       // Allow public API routes
//       if (pathname.startsWith('/api/auth/') || 
//           pathname.startsWith('/api/webhooks/') ||
//           pathname === '/api/health' ||
//           pathname === '/api') {
//         return NextResponse.next()
//       }

//       // Require authentication for other API routes
//       if (!token) {
//         return new NextResponse(
//           JSON.stringify({ error: 'Unauthorized' }), 
//           { 
//             status: 401,
//             headers: {
//               'Content-Type': 'application/json'
//             }
//           }
//         )
//       }

//       // Add user context to API requests
//       const response = NextResponse.next()
//       response.headers.set('x-user-id', token.sub || '')
//       response.headers.set('x-user-email', token.email || '')
      
//       return response
//     }

//     // ===========================
//     // SUCCESS RESPONSE
//     // ===========================
    
//     const response = NextResponse.next()
    
//     // Add security headers
//     response.headers.set('X-Frame-Options', 'DENY')
//     response.headers.set('X-Content-Type-Options', 'nosniff')
//     response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
//     response.headers.set('X-XSS-Protection', '1; mode=block')
    
//     // Add user context for authenticated requests
//     if (token) {
//       response.headers.set('x-user-authenticated', 'true')
//       response.headers.set('x-user-id', token.sub || '')
//     }

//     return response

//   } catch (error) {
//     console.error('Middleware error:', error)
    
//     // Return error response for API routes
//     if (pathname.startsWith('/api/')) {
//       return new NextResponse(
//         JSON.stringify({ error: 'Internal Server Error' }), 
//         { status: 500, headers: { 'Content-Type': 'application/json' } }
//       )
//     }
    
//     // Redirect to error page for web routes
//     return NextResponse.redirect(new URL('/auth/error', request.url))
//   }
// }

// // ===========================
// // MIDDLEWARE MATCHER
// // ===========================

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      * - public folder files
//      */
//     '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
//   ],
// }


export async function middleware(request: NextRequest) {
  return NextResponse.next();
}