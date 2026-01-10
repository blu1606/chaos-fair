/**
 * Advanced Rate Limiting Middleware
 * 
 * Supports multiple rate limit tiers:
 * - RPM (requests per minute)
 * - RPH (requests per hour)  
 * - Daily limit
 * 
 * Uses in-memory store by default, Redis-compatible interface for production
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Rate limit configuration
export interface RateLimitConfig {
  rpm: number;      // Requests per minute
  rph: number;      // Requests per hour
  daily: number;    // Requests per day
}

// Rate limit result
export interface RateLimitResult {
  allowed: boolean;
  limitType?: 'rpm' | 'rph' | 'daily';
  remaining: number;
  limit: number;
  retryAfter?: number;  // Seconds until reset
  resetAt?: number;     // Unix timestamp
}

// Rate limit entry
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory rate limit store (for serverless/development)
// In production, this would be replaced with Redis
class InMemoryRateLimitStore {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Clean up expired entries every 5 minutes
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  async get(key: string): Promise<RateLimitEntry | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() > entry.resetAt) {
      this.store.delete(key);
      return null;
    }
    
    return entry;
  }

  async set(key: string, entry: RateLimitEntry): Promise<void> {
    this.store.set(key, entry);
  }

  async increment(key: string, ttlMs: number): Promise<RateLimitEntry> {
    const now = Date.now();
    let entry = this.store.get(key);
    
    if (!entry || now > entry.resetAt) {
      // Create new entry
      entry = { count: 1, resetAt: now + ttlMs };
    } else {
      // Increment existing
      entry.count++;
    }
    
    this.store.set(key, entry);
    return entry;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.resetAt) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Redis-compatible interface for production
interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { EX?: number; PX?: number }): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
}

// Rate limiter class
export class RateLimiter {
  private memoryStore: InMemoryRateLimitStore;
  private redisClient: RedisClient | null;

  constructor(redisClient?: RedisClient) {
    this.memoryStore = new InMemoryRateLimitStore();
    this.redisClient = redisClient || null;
  }

  /**
   * Check and consume rate limit for an API key
   */
  async checkLimit(
    apiKeyId: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const now = Date.now();

    // Check RPM (requests per minute)
    const rpmResult = await this.checkSingleLimit(
      apiKeyId,
      'rpm',
      config.rpm,
      60 * 1000  // 1 minute in ms
    );
    if (!rpmResult.allowed) {
      return rpmResult;
    }

    // Check RPH (requests per hour)
    const rphResult = await this.checkSingleLimit(
      apiKeyId,
      'rph',
      config.rph,
      60 * 60 * 1000  // 1 hour in ms
    );
    if (!rphResult.allowed) {
      return rphResult;
    }

    // Check daily limit
    const dailyResult = await this.checkSingleLimit(
      apiKeyId,
      'daily',
      config.daily,
      24 * 60 * 60 * 1000  // 24 hours in ms
    );
    if (!dailyResult.allowed) {
      return dailyResult;
    }

    // All limits passed - return the tightest remaining
    const minRemaining = Math.min(
      rpmResult.remaining,
      rphResult.remaining,
      dailyResult.remaining
    );

    return {
      allowed: true,
      remaining: minRemaining,
      limit: config.rpm,  // Show RPM as primary limit
    };
  }

  /**
   * Check a single rate limit tier
   */
  private async checkSingleLimit(
    apiKeyId: string,
    period: 'rpm' | 'rph' | 'daily',
    limit: number,
    ttlMs: number
  ): Promise<RateLimitResult> {
    const key = `rate:${apiKeyId}:${period}`;

    if (this.redisClient) {
      return this.checkRedisLimit(key, period, limit, ttlMs);
    }

    return this.checkMemoryLimit(key, period, limit, ttlMs);
  }

  /**
   * Check limit using in-memory store
   */
  private async checkMemoryLimit(
    key: string,
    period: 'rpm' | 'rph' | 'daily',
    limit: number,
    ttlMs: number
  ): Promise<RateLimitResult> {
    const entry = await this.memoryStore.increment(key, ttlMs);
    const remaining = Math.max(0, limit - entry.count);
    const retryAfter = Math.ceil((entry.resetAt - Date.now()) / 1000);

    if (entry.count > limit) {
      return {
        allowed: false,
        limitType: period,
        remaining: 0,
        limit,
        retryAfter,
        resetAt: entry.resetAt,
      };
    }

    return {
      allowed: true,
      remaining,
      limit,
      resetAt: entry.resetAt,
    };
  }

  /**
   * Check limit using Redis
   */
  private async checkRedisLimit(
    key: string,
    period: 'rpm' | 'rph' | 'daily',
    limit: number,
    ttlMs: number
  ): Promise<RateLimitResult> {
    if (!this.redisClient) {
      return { allowed: true, remaining: limit, limit };
    }

    const ttlSeconds = Math.ceil(ttlMs / 1000);

    // Increment counter
    const count = await this.redisClient.incr(key);

    // Set expiry on first request
    if (count === 1) {
      await this.redisClient.expire(key, ttlSeconds);
    }

    // Get TTL for retry-after
    const ttl = await this.redisClient.ttl(key);
    const remaining = Math.max(0, limit - count);

    if (count > limit) {
      return {
        allowed: false,
        limitType: period,
        remaining: 0,
        limit,
        retryAfter: ttl > 0 ? ttl : ttlSeconds,
        resetAt: Date.now() + (ttl > 0 ? ttl * 1000 : ttlMs),
      };
    }

    return {
      allowed: true,
      remaining,
      limit,
      resetAt: Date.now() + (ttl > 0 ? ttl * 1000 : ttlMs),
    };
  }

  /**
   * Get current usage without incrementing
   */
  async getUsage(apiKeyId: string): Promise<{
    rpm: { count: number; limit: number };
    rph: { count: number; limit: number };
    daily: { count: number; limit: number };
  }> {
    const rpmEntry = await this.memoryStore.get(`rate:${apiKeyId}:rpm`);
    const rphEntry = await this.memoryStore.get(`rate:${apiKeyId}:rph`);
    const dailyEntry = await this.memoryStore.get(`rate:${apiKeyId}:daily`);

    return {
      rpm: { count: rpmEntry?.count || 0, limit: 0 },
      rph: { count: rphEntry?.count || 0, limit: 0 },
      daily: { count: dailyEntry?.count || 0, limit: 0 },
    };
  }
}

// Singleton instance
let rateLimiterInstance: RateLimiter | null = null;

export const getRateLimiter = (redisClient?: RedisClient): RateLimiter => {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter(redisClient);
  }
  return rateLimiterInstance;
};

/**
 * Rate limit middleware for API endpoints
 */
export const withRateLimit = (
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void>,
  getApiKeyId: (req: VercelRequest) => Promise<string | null>,
  getConfig: (req: VercelRequest) => Promise<RateLimitConfig>
) => {
  return async (req: VercelRequest, res: VercelResponse) => {
    const apiKeyId = await getApiKeyId(req);
    
    if (!apiKeyId) {
      // No API key, let the handler deal with auth
      return handler(req, res);
    }

    const config = await getConfig(req);
    const limiter = getRateLimiter();
    const result = await limiter.checkLimit(apiKeyId, config);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', result.limit.toString());
    res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
    
    if (result.resetAt) {
      res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000).toString());
    }

    if (!result.allowed) {
      res.setHeader('Retry-After', (result.retryAfter || 60).toString());
      
      return res.status(429).json({
        status: 'error',
        error: `Rate limit exceeded (${result.limitType})`,
        limit_type: result.limitType,
        limit: result.limit,
        remaining: 0,
        retry_after_seconds: result.retryAfter,
        reset_at: result.resetAt ? new Date(result.resetAt).toISOString() : null,
        timestamp: new Date().toISOString(),
      });
    }

    return handler(req, res);
  };
};

/**
 * Simple rate limit check function for use in existing endpoints
 */
export const checkRateLimitAdvanced = async (
  apiKeyId: string,
  config: RateLimitConfig
): Promise<RateLimitResult> => {
  const limiter = getRateLimiter();
  return limiter.checkLimit(apiKeyId, config);
};
