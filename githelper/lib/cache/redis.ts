import { Redis } from 'ioredis'

class RedisClient {
  private client: Redis | null = null

  constructor() {
    if (process.env.REDIS_URL) {
      this.client = new Redis(process.env.REDIS_URL)
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null
    return this.client.get(key)
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.client) return
    
    if (ttl) {
      await this.client.setex(key, ttl, value)
    } else {
      await this.client.set(key, value)
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return
    await this.client.del(key)
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client) return false
    return (await this.client.exists(key)) === 1
  }

  async incr(key: string, ttl?: number): Promise<number> {
    if (!this.client) return 0
    
    const value = await this.client.incr(key)
    if (ttl && value === 1) {
      await this.client.expire(key, ttl)
    }
    
    return value
  }

  async hget(hash: string, field: string): Promise<string | null> {
    if (!this.client) return null
    return this.client.hget(hash, field)
  }

  async hset(hash: string, field: string, value: string): Promise<void> {
    if (!this.client) return
    await this.client.hset(hash, field, value)
  }

  async hgetall(hash: string): Promise<Record<string, string>> {
    if (!this.client) return {}
    return this.client.hgetall(hash)
  }
}

export const redis = new RedisClient()

export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  static async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(value), ttl)
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  static async invalidate(pattern: string): Promise<void> {
    // Implementation would depend on Redis client capabilities
    // This is a simplified version
    await redis.del(pattern)
  }

  static generateKey(...parts: string[]): string {
    return parts.join(':')
  }
}
