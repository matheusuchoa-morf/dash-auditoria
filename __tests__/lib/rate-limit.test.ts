import { RateLimiter } from '@/lib/rate-limit'

describe('RateLimiter', () => {
  it('allows up to maxRequests calls', () => {
    const rl = new RateLimiter({ maxRequests: 3, windowMs: 60_000 })
    expect(rl.check('user-1')).toBe(true)
    expect(rl.check('user-1')).toBe(true)
    expect(rl.check('user-1')).toBe(true)
    expect(rl.check('user-1')).toBe(false)
  })

  it('resets after window expires', () => {
    const rl = new RateLimiter({ maxRequests: 1, windowMs: 1 })
    rl.check('user-2')
    return new Promise(resolve => setTimeout(() => {
      expect(rl.check('user-2')).toBe(true)
      resolve(undefined)
    }, 10))
  })

  it('tracks different users independently', () => {
    const rl = new RateLimiter({ maxRequests: 1, windowMs: 60_000 })
    expect(rl.check('user-a')).toBe(true)
    expect(rl.check('user-b')).toBe(true)
    expect(rl.check('user-a')).toBe(false)
    expect(rl.check('user-b')).toBe(false)
  })
})
