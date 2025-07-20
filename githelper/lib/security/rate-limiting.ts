import { NextRequest } from 'next/server'

interface RateLimit {
  count: number
  resetTime: number
}

const rateLimits = new Map<string, RateLimit>()

export class RateLimiter {
  private windowMs: number
  private maxRequests: number

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const limit = rateLimits.get(identifier)

    if (!limit || now > limit.resetTime) {
      rateLimits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return true
    }

    if (limit.count >= this.maxRequests) {
      return false
    }

    limit.count++
    return true
  }

  getRemainingRequests(identifier: string): number {
    const limit = rateLimits.get(identifier)
    if (!limit) return this.maxRequests
    
    return Math.max(0, this.maxRequests - limit.count)
  }

  getResetTime(identifier: string): number {
    const limit = rateLimits.get(identifier)
    return limit?.resetTime || Date.now() + this.windowMs
  }
}

export function createRateLimitMiddleware(windowMs: number, maxRequests: number) {
  const limiter = new RateLimiter(windowMs, maxRequests)

  return (request: NextRequest, identifier?: string) => {
    const id = identifier || getClientIdentifier(request)
    const allowed = limiter.isAllowed(id)

    return {
      allowed,
      remaining: limiter.getRemainingRequests(id),
      resetTime: limiter.getResetTime(id)
    }
  }
}

function getClientIdentifier(request: NextRequest): string {
  // Use IP address or user ID as identifier
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.ip
  return ip || 'unknown'
}
