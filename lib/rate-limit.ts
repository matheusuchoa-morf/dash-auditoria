interface RateLimiterOptions {
  maxRequests: number
  windowMs: number
}

interface BucketEntry {
  count: number
  resetAt: number
}

export class RateLimiter {
  private buckets = new Map<string, BucketEntry>()
  private maxRequests: number
  private windowMs: number

  constructor(opts: RateLimiterOptions) {
    this.maxRequests = opts.maxRequests
    this.windowMs = opts.windowMs
  }

  check(userId: string): boolean {
    const now = Date.now()
    const entry = this.buckets.get(userId)

    if (!entry || now > entry.resetAt) {
      this.buckets.set(userId, { count: 1, resetAt: now + this.windowMs })
      return true
    }

    if (entry.count >= this.maxRequests) return false
    entry.count++
    return true
  }
}

// Singleton limiters — 5 audits per hour per user
export const instagramAuditLimiter = new RateLimiter({ maxRequests: 5, windowMs: 3_600_000 })
export const lpAuditLimiter = new RateLimiter({ maxRequests: 5, windowMs: 3_600_000 })
