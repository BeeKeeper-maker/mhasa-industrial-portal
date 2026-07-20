// ============================================================================
// In-Memory Token-Bucket Rate Limiter
// Protects public endpoints (contact, apply, login) from abuse.
// ============================================================================

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

interface RateLimitOptions {
  /** Maximum tokens in the bucket. */
  capacity: number;
  /** Tokens added per second. */
  refillRate: number;
}

/**
 * Returns true if the request is allowed, false if rate-limited.
 * Uses a token-bucket algorithm with in-memory storage.
 */
export function rateLimit(
  key: string,
  opts: RateLimitOptions = { capacity: 10, refillRate: 0.5 }
): { success: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket) {
    buckets.set(key, { tokens: opts.capacity - 1, lastRefill: now });
    return { success: true, remaining: opts.capacity - 1, resetInMs: Math.ceil(1000 / opts.refillRate) };
  }

  const elapsed = (now - bucket.lastRefill) / 1000;
  const refilled = Math.min(opts.capacity, bucket.tokens + elapsed * opts.refillRate);
  bucket.lastRefill = now;

  if (refilled >= 1) {
    bucket.tokens = refilled - 1;
    return {
      success: true,
      remaining: Math.floor(bucket.tokens),
      resetInMs: Math.ceil(1000 / opts.refillRate),
    };
  }

  bucket.tokens = refilled;
  return {
    success: false,
    remaining: 0,
    resetInMs: Math.ceil((1 - refilled) / opts.refillRate) * 1000,
  };
}

/** Get client IP from Next.js request headers (handles proxies). */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
